# -*- coding: utf-8 -*-
"""Remove Institution Handler test."""

from test_base_handler import TestBaseHandler
from worker import RemoveInstitutionHandler
import mocks
from permissions import DEFAULT_ADMIN_PERMISSIONS
from test_base_handler import has_permissions


class RemoveInstitutionHandlerTest(TestBaseHandler):
    """Test Remove Institution Handler."""

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(RemoveInstitutionHandlerTest, cls).setUp()
        methods = set(cls.webapp2.WSGIApplication.allowed_methods)
        methods.add('PATCH')
        cls.webapp2.WSGIApplication.allowed_methods = frozenset(methods)
        app = cls.webapp2.WSGIApplication(
            [
                ('/api/queue/remove-inst', RemoveInstitutionHandler)
            ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)

    def test_post(self):
        """Test the post method."""
        # Verify the members
        admin = mocks.create_user()
        common_user = mocks.create_user()
        institution = mocks.create_institution()
        child_institution = mocks.create_institution()
        institution.address = mocks.create_address()
        admin.institutions_admin = [institution.key]
        admin.add_institution(institution.key)
        admin.follows = [institution.key]
        institution.members = [admin.key, common_user.key]
        institution.set_admin(admin.key)
        child_institution.parent_institution = institution.key
        child_institution.admin = common_user.key
        common_user.institutions_admin = [child_institution.key]
        institution.children_institutions.append(child_institution.key)
        institution.put()
        child_institution.put()
        common_user.add_institution(institution.key)
        common_user.follows = [institution.key]
        admin.put()
        common_user.put()
        self.assertTrue(institution.key in admin.institutions)
        self.assertTrue(institution.key in common_user.institutions)
        admin.add_permissions(DEFAULT_ADMIN_PERMISSIONS, institution.key.urlsafe())
        admin.add_permissions(DEFAULT_ADMIN_PERMISSIONS,
                              child_institution.key.urlsafe())
        # Call the post method
        self.testapp.post('/api/queue/remove-inst?institution_key=%s&remove_hierarchy=true&user_key=%s'
                          % (institution.key.urlsafe(), admin.key.urlsafe()))
        # Retrieving the entities
        admin = admin.key.get()
        common_user = common_user.key.get()
        child_institution = child_institution.key.get()
        # Check if the method worked as expected
        self.assertFalse(has_permissions(admin, institution.key.urlsafe(), DEFAULT_ADMIN_PERMISSIONS))
        self.assertFalse(has_permissions(
            admin, child_institution.key.urlsafe(), DEFAULT_ADMIN_PERMISSIONS))
        self.assertTrue(child_institution.state == 'inactive')
