# -*- coding: utf-8 -*-
"""Institution member handler test."""

from test_base_handler import TestBaseHandler
from models.user import User
from models.institution import Institution
from handlers.institution_members_handler import InstitutionMembersHandler
from mock import patch


class InstitutionHierarchyHandlerTest(TestBaseHandler):
    """Test Institution Hierarchie Handler class."""

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(InstitutionHierarchyHandlerTest, cls).setUp()
        app = cls.webapp2.WSGIApplication(
            [("/api/institutions/(.*)/members", InstitutionMembersHandler)
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)
        initModels(cls)

    @patch('utils.verify_token', return_value={'email': 'user@gmail.com'})
    def test_delete(self, verify_token):
        """Test delete method"""
        # Assert the initial conditions
        self.assertTrue(self.second_user.key in self.institution.members)
        self.assertTrue(self.institution.key in self.second_user.institutions)
        # Call the delete method
        self.testapp.delete("/api/institutions/%s/members?removeMember=%s" %
                            (self.institution.key.urlsafe(), self.second_user.key.urlsafe()))
        # Update the institutions
        self.institution = self.institution.key.get()
        self.splab = self.splab.key.get()
        # Assert the final conditions
        self.assertTrue(
            self.splab.key not in self.institution.children_institutions)
        self.assertTrue(self.splab.parent_institution == self.institution.key)


    def tearDown(cls):
        """Deactivate the test."""
        cls.test.deactivate()


def initModels(cls):
    """Init the models."""
    # new User user
    cls.user = User()
    cls.user.name = 'user Nunes'
    cls.user.state = "active"
    cls.user.email = ['user@gmail.com']
    cls.user.institutions = []
    cls.user.follows = []
    cls.user.institutions_admin = []
    cls.user.posts = []
    cls.user.put()
    # new User second_user
    cls.second_user = User()
    cls.second_user.name = 'second_user Smaneoto'
    cls.second_user.email = ['second_user.smaneoto@ccc.ufcg.edu.br']
    cls.second_user.state = "active"
    cls.second_user.institutions = []
    cls.second_user.follows = []
    cls.second_user.institutions_admin = []
    cls.second_user.posts = []
    cls.second_user.put()
    # new Institution institution
    cls.institution = Institution()
    cls.institution.name = 'institution'
    cls.institution.state = "active"
    cls.institution.email = 'institution@ufcg.edu.br'
    cls.institution.members = [cls.user.key, cls.second_user.key]
    cls.institution.followers = [cls.user.key, cls.second_user.key]
    cls.institution.posts = []
    cls.institution.admin = cls.user.key
    cls.institution.put()

    cls.user.institutions_admin = [cls.institution.key]
    cls.user.put()
    cls.second_user.institutions = [cls.institution.key]
    cls.second_user.put()
