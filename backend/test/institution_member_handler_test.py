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
        """Test delete method with user admin"""
        # Assert the initial conditions
        self.assertTrue(self.second_user.key in self.institution.members)
        self.assertTrue(self.institution.key in self.second_user.institutions)
        # Call the delete method
        self.testapp.delete("/api/institutions/%s/members?removeMember=%s" %
                            (self.institution.key.urlsafe(), self.second_user.key.urlsafe()))

        # Update the institutions
        self.institution = self.institution.key.get()
        self.second_user = self.second_user.key.get()
        # Assert the final conditions
        self.assertTrue(self.user.key in self.institution.members)

        self.assertTrue(self.second_user.key not in self.institution.members)
        self.assertTrue(
            self.institution.key not in self.second_user.institutions)
        # In case that user has one institution, he turn of .
        self.assertEqual(self.second_user.state, "inactive")

    @patch('utils.verify_token', return_value={'email': 'second_user@gmail.com'})
    def test_delete_not_admin(self, verify_token):
        """Test delete method with user not admin"""
        # Assert the initial conditions
        self.assertTrue(self.second_user.key in self.institution.members)
        self.assertTrue(self.institution.key in self.second_user.institutions)
        # Call the delete method
        with self.assertRaises(Exception) as ex:
            self.testapp.delete("/api/institutions/%s/members?removeMember=%s" %
                                (self.institution.key.urlsafe(), self.second_user.key.urlsafe()))

        exception_message = self.get_message_exception(ex.exception.message)
        self.assertEqual(
            "Error! User is not admin",
            exception_message,
            "Expected error message is Error! User is not admin")

        # Update the institutions
        self.institution = self.institution.key.get()
        self.second_user = self.second_user.key.get()
        # Assert the final conditions
        self.assertTrue(self.second_user.key in self.institution.members)
        self.assertTrue(self.institution.key in self.second_user.institutions)

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
    cls.user.add_permission("publish_post", cls.institution.key.urlsafe())
    cls.user.put()
    cls.second_user.institutions = [cls.institution.key]
    cls.second_user.add_permission(
        "publish_post", cls.institution.key.urlsafe())
    cls.second_user.put()
