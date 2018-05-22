# -*- coding: utf-8 -*-
"""Institution follower handler test."""
from test_base_handler import TestBaseHandler
from handlers.institution_followers_handler import InstitutionFollowersHandler
import mocks

from mock import patch

USER = {'email': 'user@email.com'}

class InstitutionFollowersHandlerTest(TestBaseHandler):
    """Test the institution_followers_handler class."""

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(InstitutionFollowersHandlerTest, cls).setUp()
        app = cls.webapp2.WSGIApplication(
            [("/api/institutions/(.*)/followers",
                InstitutionFollowersHandler)
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)

    @patch('util.login_service.verify_token', return_value=USER)
    def teste_delete_usermember(self, verify_token):
        """Test that user member try unfollow the institution."""
        user = mocks.create_user(USER['email'])
        institution = mocks.create_institution()
        user.follow(institution.key)
        user.add_institution(institution.key)
        institution.followers = [user.key]
        institution.add_member(user)
        self.assertEquals(len(institution.followers), 1,
                          "The institution should have a follower")
        self.assertEquals(len(user.follows), 1,
                          "The user should follow an institution")

        # Call the delete method
        self.testapp.delete("/api/institutions/%s/followers" %
                            institution.key.urlsafe())

        # Update the objects
        user = user.key.get()
        institution = institution.key.get()

        # Assert that the institution hasn't been removed from user.follows
        self.assertEquals(len(user.follows), 1,
                          "The user should follow an institution")
        # Assert that the user hasn't been removed from the followers
        self.assertEquals(len(institution.followers), 1,
                          "The institution should have a follower")
    
    @patch('util.login_service.verify_token', return_value=USER)
    def teste_delete_usermember_health_ministry(self, verify_token):
        """Test that user member try unfollow the health ministry institution."""
        user = mocks.create_user(USER['email'])
        institution = mocks.create_institution()
        user.follow(institution.key)
        user.add_institution(institution.key)
        institution.followers = [user.key]
        institution.name = "Ministério da Saúde"
        institution.add_member(user)
        self.assertEquals(len(institution.followers), 1,
                          "The institution should have a follower")
        self.assertEquals(len(user.follows), 1,
                          "The user should follow an institution")

        # Call the delete method
        with self.assertRaises(Exception) as raises_context:
            self.testapp.delete("/api/institutions/%s/followers" %
                            institution.key.urlsafe())

        message_exception = self.get_message_exception(str(raises_context.exception))

        self.assertEqual(
            message_exception,
            "Error! The institution can not be unfollowed",
            "Expected exception message must be equal to Error! The institution can not be unfollowed")

        
    @patch('util.login_service.verify_token', return_value=USER)
    def test_delete(self, verify_token):
        """Test the institution_follower_handler delete method."""
        user = mocks.create_user(USER['email'])
        institution = mocks.create_institution()
        user.follow(institution.key)
        institution.follow(user.key)
        # Assert that the user follows the institution
        self.assertEquals(len(institution.followers), 1,
                          "The institution should have a follower")
        self.assertEquals(len(user.follows), 1,
                          "The user should follow an institution")

        # Call the delete method
        self.testapp.delete("/api/institutions/%s/followers" %
                            institution.key.urlsafe())

        # Update the objects
        user = user.key.get()
        institution = institution.key.get()
        # Assert that the user doesn't follow the institution
        self.assertEquals(len(user.follows), 0,
                          "The user shouldn't follow any institution")
        self.assertEquals(len(institution.followers), 0,
                          "The institution shouldn't have any follower")

    @patch('util.login_service.verify_token', return_value=USER)
    def test_post(self, verify_token):
        """Test the institution_follower_handler post method."""
        user = mocks.create_user(USER['email'])
        institution = mocks.create_institution()
        institution.put()
        self.assertEquals(len(institution.followers), 0,
                          "The institution shouldn't have any follower")
        self.assertEquals(len(user.follows), 0,
                          "The user shouldn't follow any institution")
        # Call the post method
        self.testapp.post("/api/institutions/%s/followers" %
                          institution.key.urlsafe())

        # Update the objects
        user = user.key.get()
        institution = institution.key.get()

        # Assert that the user follows the institution
        self.assertEquals(len(user.follows), 1,
                          "The user should follow institution")
        self.assertEquals(len(institution.followers), 1,
                          "The institution should have a follower")
        self.assertTrue(user.key in institution.followers,
                        "user should be an institution's follower")
        self.assertTrue(institution.key in user.follows,
                        "institution should be in user.follows")

        # Call the post method
        self.testapp.post("/api/institutions/%s/followers" %
                          institution.key.urlsafe())
        # Assert that the user hasn't been added to the institution's followers
        # again
        self.assertEquals(len(institution.followers), 1,
                          "The institution should have a follower")
        self.assertEquals(len(user.follows), 1,
                          "The user should follow institution")
