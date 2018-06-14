# -*- coding: utf-8 -*-
"""Institution Followers handler test."""

from ..test_base_handler import TestBaseHandler
from models import User
from models import Institution
from handlers.institution_followers_handler import InstitutionFollowersHandler
from mock import patch
from utils import Utils


class InstitutionFollowersHandlerTest(TestBaseHandler):
    """Test Institution Followers Handler class."""

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(InstitutionFollowersHandlerTest, cls).setUp()
        app = cls.webapp2.WSGIApplication(
            [("/api/institutions/(.*)/followers", InstitutionFollowersHandler)
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)
        initModels(cls)

    @patch('util.login_service.verify_token', return_value={'email': 'user@gmail.com'})
    def test_get(self, verify_token):
        """Test http get method."""
        result = self.testapp.get("/api/institutions/%s/followers"
                                  % self.institution.key.urlsafe())
        self.assertTrue(len(result.json) == 2)
        self.assertTrue(Utils.toJson(self.user) in result.json)
        self.assertTrue(Utils.toJson(self.second_user) in result.json)

    @patch('util.login_service.verify_token', return_value={'email': 'second_user@ccc.ufcg.edu.br'})
    def test_post(self, verify_token):
        """Test post method."""
        """Assert the initials conditions"""
        self.assertTrue(
            self.second_user.key not in self.other_institution.followers)
        self.assertTrue(
            self.other_institution.key not in self.second_user.follows)
        # Call the post method
        self.testapp.post("/api/institutions/%s/followers" %
                          self.other_institution.key.urlsafe())
        # Update entities
        self.second_user = self.second_user.key.get()
        self.other_institution = self.other_institution.key.get()
        # Check the final conditions
        self.assertTrue(
            self.second_user.key in self.other_institution.followers)
        self.assertTrue(self.other_institution.key in self.second_user.follows)

    @patch('util.login_service.verify_token', return_value={'email': 'second_user@ccc.ufcg.edu.br'})
    def test_post_with_inactive_institution(self, verify_token):
        """Test post method with an inactive institution."""
        # Set up the test
        self.other_institution.state = "inactive"
        self.other_institution.put()
        # Assert that the post's call will raise an exception
        with self.assertRaises(Exception) as ex:
            self.testapp.post("/api/institutions/%s/followers" %
                              self.other_institution.key.urlsafe())
        exception_message = self.get_message_exception(ex.exception.message)
        self.assertTrue(exception_message ==
                        "Error! This institution is not active")

    @patch('util.login_service.verify_token', return_value={'email': 'second_user@ccc.ufcg.edu.br'})
    def test_delete(self, verify_token):
        """Test delete method."""
        # Assert initials conditions
        self.assertTrue(self.second_user.key in self.institution.followers)
        self.assertTrue(self.institution.key in self.second_user.follows)
        # Call the delete method
        self.testapp.delete("/api/institutions/%s/followers" %
                            self.institution.key.urlsafe())
        # Update the entities
        self.second_user = self.second_user.key.get()
        self.institution = self.institution.key.get()
        # Assert the final conditions
        self.assertTrue(self.second_user.key not in self.institution.followers)
        self.assertTrue(self.institution.key not in self.second_user.follows)

    @patch('util.login_service.verify_token', return_value={'email': 'user@gmail.com'})
    def test_delete_with_a_member(self, verify_token):
        """Test delete when the user is a member

        The user can't unfollow the institution because he is a member
        That's what the test expect
        """
        # Assert initials conditions
        self.assertTrue(self.user.key in self.institution.followers)
        self.assertTrue(self.institution.key in self.user.follows)
        # Call the delete method
        self.testapp.delete("/api/institutions/%s/followers" %
                            self.institution.key.urlsafe())
        # Update the entities
        self.user = self.user.key.get()
        self.institution = self.institution.key.get()
        # Assert the final conditions, the user still follows the institution
        # because he is a member
        self.assertTrue(self.user.key in self.institution.followers)
        self.assertTrue(self.institution.key in self.user.follows)

    def tearDown(cls):
        """Deactivate the test."""
        cls.test.deactivate()


def initModels(cls):
    """Init the models."""
    # new User user
    cls.user = User()
    cls.user.name = 'user'
    cls.user.state = "active"
    cls.user.email = ['user@gmail.com']
    cls.user.institutions = []
    cls.user.follows = []
    cls.user.institutions_admin = []
    cls.user.posts = []
    cls.user.put()
    # new User second_user
    cls.second_user = User()
    cls.second_user.name = 'second_user'
    cls.second_user.email = ['second_user@ccc.ufcg.edu.br']
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
    cls.institution.members = [cls.user.key]
    cls.institution.followers = [cls.user.key, cls.second_user.key]
    cls.institution.posts = []
    cls.institution.admin = cls.user.key
    cls.institution.put()
    # another institution
    cls.other_institution = Institution()
    cls.other_institution.name = 'other_institution'
    cls.other_institution.state = 'active'
    cls.other_institution.email = 'other_institution@email.com'
    cls.other_institution.members = [cls.user.key]
    cls.other_institution.followers = [cls.user.key]
    cls.other_institution.posts = []
    cls.other_institution.admin = cls.user.key
    cls.other_institution.put()

    cls.user.institutions = [cls.institution.key, cls.other_institution.key]
    cls.user.institutions_admin = [
        cls.institution.key, cls.other_institution.key]
    cls.user.follows = [cls.other_institution.key, cls.institution.key]
    cls.user.put()
    cls.second_user.follows = [cls.institution.key]
    cls.second_user.put()
