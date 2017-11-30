# -*- coding: utf-8 -*-
"""Institution hierarchy handler test."""

from test_base_handler import TestBaseHandler
from models.user import User
from models.institution import Institution
from handlers.institution_hierarchy_handler import InstitutionHierarchyHandler
from mock import patch


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
        initModels(cls)

    @patch('utils.verify_token', return_value={'email': 'user1@gmail.com'})
    def test_delete_child_connection(self, verify_token):
        """Test delete method with isParent=false."""
        # Assert the initial conditions
        self.assertTrue(self.otherinst.key in self.institution.children_institutions)
        self.assertTrue(self.otherinst.parent_institution == self.institution.key)
        # Call the delete method
        self.testapp.delete("/api/institutions/%s/hierarchy/%s?isParent=false" %
                            (self.institution.key.urlsafe(), self.otherinst.key.urlsafe()))
        # Update the institutions
        self.institution = self.institution.key.get()
        self.otherinst = self.otherinst.key.get()
        # Assert the final conditions
        self.assertTrue(
            self.otherinst.key not in self.institution.children_institutions)
        self.assertTrue(self.otherinst.parent_institution == self.institution.key)

    @patch('utils.verify_token', return_value={'email': 'otheruser@ccc.ufcg.edu.br'})
    def test_delete_parent_connection(self, verify_token):
        """Test delete method with isParent=true."""
        # Assert the initial conditions
        self.assertTrue(self.otherinst.key in self.institution.children_institutions)
        self.assertTrue(self.otherinst.parent_institution == self.institution.key)
        # Call the delete method
        self.testapp.delete("/api/institutions/%s/hierarchy/%s?isParent=true" %
                            (self.otherinst.key.urlsafe(), self.institution.key.urlsafe()))
        # Update the institutions
        self.institution = self.institution.key.get()
        self.otherinst = self.otherinst.key.get()
        # Assert the final conditions
        self.assertTrue(
            self.otherinst.key in self.institution.children_institutions)
        self.assertTrue(self.otherinst.parent_institution is None)

    def tearDown(cls):
        """Deactivate the test."""
        cls.test.deactivate()


def initModels(cls):
    """Init the models."""
    # new User User 1
    cls.user = User()
    cls.user.name = 'User 1'
    cls.user.cpf = '089.675.908-90'
    cls.user.email = ['user1@gmail.com']
    cls.user.put()
    # new User User 2
    cls.otheruser = User()
    cls.otheruser.name = 'User 2'
    cls.otheruser.cpf = '089.675.908-65'
    cls.otheruser.email = ['otheruser@ccc.ufcg.edu.br']
    cls.otheruser.state = "pending"
    cls.otheruser.put()
    # new Institution Inst
    cls.institution = Institution()
    cls.institution.name = 'Inst'
    cls.institution.state = "active"
    cls.institution.acronym = 'INST'
    cls.institution.members = [cls.user.key, cls.otheruser.key]
    cls.institution.followers = [cls.user.key, cls.otheruser.key]
    cls.institution.admin = cls.user.key
    cls.institution.put()
    cls.user.institutions_admin = [cls.institution.key]
    cls.user.add_permission("remove_link", cls.institution.key.urlsafe())
    cls.user.put()
    # new Institution Other Inst
    cls.otherinst = Institution()
    cls.otherinst.name = 'Other Inst'
    cls.otherinst.acronym = 'OTHER'
    cls.otherinst.cnpj = '18.104.068/0000-86'
    cls.otherinst.legal_nature = 'public'
    cls.otherinst.actuation_area = ''
    cls.otherinst.state = "active"
    cls.otherinst.members = [cls.user.key, cls.otheruser.key]
    cls.otherinst.followers = [cls.user.key, cls.otheruser.key]
    cls.otherinst.admin = cls.otheruser.key
    cls.otherinst.parent_institution = cls.institution.key
    cls.otherinst.put()
    cls.otheruser.institutions_admin = [cls.otherinst.key]
    cls.otheruser.add_permission("remove_link", cls.otherinst.key.urlsafe())
    cls.otheruser.put()
    cls.institution.children_institutions.append(cls.otherinst.key)
    cls.institution.put()
