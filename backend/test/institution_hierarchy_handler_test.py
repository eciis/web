# -*- coding: utf-8 -*-
"""Institution hierarchy handler test."""

from test_base_handler import TestBaseHandler
from handlers.institution_hierarchy_handler import InstitutionHierarchyHandler
from mock import patch
import mocks

ADMIN = {'email': 'user1@gmail.com'}
USER = {'email': 'otheruser@ccc.ufcg.edu.br'}

class InstitutionHierarchyHandlerTest(TestBaseHandler):
    """Test Institution Hierarchie Handler class."""

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(InstitutionHierarchyHandlerTest, cls).setUp()
        methods = set(cls.webapp2.WSGIApplication.allowed_methods)
        methods.add('PATCH')
        cls.webapp2.WSGIApplication.allowed_methods = frozenset(methods)
        app = cls.webapp2.WSGIApplication(
            [("/api/institutions/(.*)/hierarchy/(.*)", InstitutionHierarchyHandler)
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)

    @patch('utils.verify_token', return_value=ADMIN)
    def test_delete_child_connection(self, verify_token):
        """Test delete method with isParent=false."""
        # Assert the initial conditions
        admin = mocks.create_user(ADMIN['email'])
        otheruser = mocks.create_user(USER['email'])
        institution = mocks.create_institution()
        institution.address = mocks.create_address()
        otherinst = mocks.create_institution()
        otherinst.address = mocks.create_address()
        institution.add_member(admin)
        otherinst.add_member(otheruser)
        admin.institutions_admin = [institution.key]
        otheruser.institutions_admin = [otherinst.key]
        admin.add_institution(institution.key)
        otheruser.add_institution(otherinst.key)
        institution.admin = admin.key
        otherinst.admin = otheruser.key
        institution.children_institutions.append(otherinst.key)
        otherinst.parent_institution = institution.key
        admin.add_permissions(["remove_inst", "remove_link"], otherinst.key.urlsafe())
        otheruser.add_permission("remove_link", institution.key.urlsafe())
        institution.put()
        otherinst.put()
        self.assertTrue(otherinst.key in institution.children_institutions)
        self.assertTrue(otherinst.parent_institution == institution.key)
        # Call the delete method
        self.testapp.delete("/api/institutions/%s/hierarchy/%s?isParent=false" %
                            (institution.key.urlsafe(), otherinst.key.urlsafe()))
        # Update the institutions
        institution = institution.key.get()
        otherinst = otherinst.key.get()
        # Assert the final conditions
        self.assertTrue(
            otherinst.key not in institution.children_institutions)
        self.assertTrue(otherinst.parent_institution == institution.key)

    @patch('utils.verify_token', return_value=USER)
    def test_delete_parent_connection(self, verify_token):
        """Test delete method with isParent=true."""
        # Assert the initial conditions
        admin = mocks.create_user(ADMIN['email'])
        otheruser = mocks.create_user(USER['email'])
        institution = mocks.create_institution()
        institution.address = mocks.create_address()
        otherinst = mocks.create_institution()
        otherinst.address = mocks.create_address()
        institution.add_member(admin)
        otherinst.add_member(otheruser)
        admin.institutions_admin = [institution.key]
        otheruser.institutions_admin = [otherinst.key]
        admin.add_institution(institution.key)
        otheruser.add_institution(otherinst.key)
        institution.admin = admin.key
        otherinst.admin = otheruser.key
        institution.children_institutions.append(otherinst.key)
        otherinst.parent_institution = institution.key
        admin.add_permissions(["remove_inst", "remove_link"], otherinst.key.urlsafe())
        otheruser.add_permission("remove_link", institution.key.urlsafe())
        institution.put()
        otherinst.put()
        self.assertTrue(otherinst.key in institution.children_institutions)
        self.assertTrue(otherinst.parent_institution == institution.key)
        # Call the delete method
        self.testapp.delete("/api/institutions/%s/hierarchy/%s?isParent=true" %
                            (otherinst.key.urlsafe(), institution.key.urlsafe()))
        # Update the institutions
        institution = institution.key.get()
        otherinst = otherinst.key.get()
        # Assert the final conditions
        self.assertTrue(
            otherinst.key in institution.children_institutions)
        self.assertTrue(otherinst.parent_institution is None)

    def tearDown(cls):
        """Deactivate the test."""
        cls.test.deactivate()
