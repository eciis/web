# -*- coding: utf-8 -*-
"""Remove Institution Handler test."""

from test_base_handler import TestBaseHandler
from worker import RemoveInstitutionHandler
import mocks


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
        institution.address = mocks.create_address()
        admin.institutions_admin = [institution.key]
        admin.add_institution(institution.key)
        institution.members = [admin.key, common_user.key]
        institution.put()
        common_user.add_institution(institution.key)
        self.assertTrue(institution.key in admin.institutions)
        self.assertTrue(institution.key in common_user.institutions)
        # Call the post method
        self.testapp.post('/api/queue/remove-inst?institution_key=%s&remove_hierarchy=true'
                          % (institution.key.urlsafe()))
        # Retrieving the entities
        admin = admin.key.get()
        common_user = common_user.key.get()
        # Check if the method worked as expected
        self.assertTrue(institution.key not in admin.institutions)
        self.assertTrue(institution.key not in common_user.institutions)
        self.assertTrue(institution.key not in admin.institutions_admin)
