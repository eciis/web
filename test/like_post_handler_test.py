# -*- coding: utf-8 -*-
"""Like Post handler test."""
import json
from test_base_handler import TestBaseHandler
from models.post import Post
from models.user import User
from models.institution import Institution
from handlers.like_post_handler import LikePostHandler

from mock import patch


class LikePostHandlerTest(TestBaseHandler):
    """Test the handler like_post_handler."""

    LIKE_URI = "/api/posts/%s/likes"

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(LikePostHandlerTest, cls).setUp()
        app = cls.webapp2.WSGIApplication(
            [("/api/posts/(.*)/likes", LikePostHandler),
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)
        initModels(cls)

    @patch('utils.verify_token', return_value={'email': 'otheruser@example.com'})
    def test_get(self, verify_token):
        """Test method get of LikePostHandler."""
        # Call the get method
        data = self.testapp.get(self.LIKE_URI % self.user_post.key.urlsafe())
        # Verify the status of request
        self.assertEqual(data.status, '200 OK')
        # Get the body of request
        likes = json.loads(data.body)
        # Get the key of authors of likes
        authors = [like['author'].split('/')[-1] for like in likes]
        # Checks if the key of Other User are not in the authors
        self.assertNotIn(self.other_user.key.urlsafe(), authors)
        # Call the post method
        self.testapp.post(self.LIKE_URI % self.user_post.key.urlsafe())
        # Verify if after the like the number of likes at post is 1
        self.user_post = self.user_post.key.get()
        self.assertEqual(self.user_post.get_number_of_likes(), 1,
                         "The number of likes expected was 1, but was %d"
                         % self.user_post.get_number_of_likes())
        # Call the get method
        data = self.testapp.get(self.LIKE_URI % self.user_post.key.urlsafe())
        # Verify the status of request
        self.assertEqual(data.status, '200 OK')
        # Get the body of request
        likes = json.loads(data.body)
        # Get the key of authors of likes
        authors = [like['author'].split('/')[-1] for like in likes]
        # Checks if the key of Other User are in the authors
        self.assertIn(self.other_user.name, authors)

    @patch('utils.verify_token')
    def test_post(self, verify_token):
        """Test the like_post_handler's post method."""
        verify_token.return_value={'email': 'otheruser@example.com'}
        # Verify if before the like the number of likes at post is 0
        self.assertEqual(self.user_post.get_number_of_likes(), 0,
                         "The number of likes expected was 0, but was %d"
                         % self.user_post.get_number_of_likes())
        # Call the post method
        self.testapp.post(self.LIKE_URI % self.user_post.key.urlsafe())
        # Verify if after the like the number of likes at post is 1
        self.user_post = self.user_post.key.get()
        self.assertEqual(self.user_post.get_number_of_likes(), 1,
                         "The number of likes expected was 1, but was %d"
                         % self.user_post.get_number_of_likes())
        # Call the post method again
        with self.assertRaises(Exception) as exc:
            self.testapp.post(self.LIKE_URI % self.user_post.key.urlsafe())
        # Verify if message exception
        exc = get_message_exception(self, exc.exception.message)
        self.assertEquals(exc, "Error! User already liked this publication")
        # Refresh user_post
        self.user_post = self.user_post.key.get()
        # Verify if after the other like the number of likes at post is 1 yet
        self.assertEqual(self.user_post.get_number_of_likes(), 1,
                         "The number of likes expected was 1, but was %d"
                         % self.user_post.get_number_of_likes())
        # Authentication with User
        verify_token.return_value={'email': 'user@example.com'}
        # Call the post method
        self.testapp.post(self.LIKE_URI % self.user_post.key.urlsafe())
        # Refresh user_post
        self.user_post = self.user_post.key.get()
        # Verify if after the like with other user the number of likes at
        # post is 2
        self.assertEqual(self.user_post.get_number_of_likes(), 2,
                         "The number of likes expected was 2, but was %d"
                         % self.user_post.get_number_of_likes())

    @patch('utils.verify_token', return_value={'email': 'otheruser@example.com'})
    def test_delete(self, verify_token):
        """Test the like_post_handler's delete method."""
        # Call the post method
        self.testapp.post(self.LIKE_URI % self.user_post.key.urlsafe())
        # Refresh user_post
        self.user_post = self.user_post.key.get()
        # Verify if after the like the number of likes at post is 1
        self.assertEqual(self.user_post.get_number_of_likes(), 1,
                         "The number of likes expected was 1, but was %d"
                         % self.user_post.get_number_of_likes())
        # Call the delete method
        self.testapp.delete(self.LIKE_URI % self.user_post.key.urlsafe())
        # Refresh user_post
        self.user_post = self.user_post.key.get()
        # Verify if after the dislike the number of likes at post is 0
        self.assertEqual(self.user_post.get_number_of_likes(), 0,
                         "The number of likes expected was 0, but was %d"
                         % self.user_post.get_number_of_likes())
        # Call the delete method again
        with self.assertRaises(Exception) as ex:
            self.testapp.delete(self.LIKE_URI % self.user_post.key.urlsafe())
        # Verify if message exception
        ex = get_message_exception(self, ex.exception.message)
        self.assertEquals(ex, "Error! User hasn't liked this publication.")
        # Refresh user_post
        self.user_post = self.user_post.key.get()
        # Verify if after the other dislike the number of likes at post is 0
        self.assertEqual(self.user_post.get_number_of_likes(), 0,
                         "The number of likes expected was 0, but was %d"
                         % self.user_post.get_number_of_likes())

    def tearDown(cls):
        """Deactivate the test."""
        cls.test.deactivate()


def initModels(cls):
    """Init the models."""
    # new User User
    cls.user = User()
    cls.user.name = 'User'
    cls.user.email = 'user@example.com'
    cls.user.put()
    # new User Other User
    cls.other_user = User()
    cls.other_user.name = 'Other User'
    cls.other_user.email = 'otheruser@example.com'
    cls.other_user.put()
    # new Institution SPLAB
    cls.institution = Institution()
    cls.institution.name = 'SPLAB'
    cls.institution.email = 'institution@example.com'
    cls.institution.members = [cls.user.key, cls.other_user.key]
    cls.institution.followers = [cls.user.key, cls.other_user.key]
    cls.institution.admin = cls.user.key
    cls.institution.put()
    # Post of User To SPLAB
    cls.user_post = Post()
    cls.user_post.author = cls.user.key
    cls.user_post.institution = cls.institution.key
    cls.user_post.put()


def get_message_exception(cls, exception):
    """Return only message of string exception."""
    cls.list_args = exception.split("\n")
    cls.dict = eval(cls.list_args[1])
    return cls.dict["msg"]
