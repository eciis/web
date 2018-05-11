# -*- coding: utf-8 -*-
"""Like Post handler test."""
import json
from test_base_handler import TestBaseHandler
from models.post import Post
from models import User
from models import Institution
from handlers.like_handler import LikeHandler

import mocks
from mock import patch


class LikePostHandlerTest(TestBaseHandler):
    """Test the handler like_post_handler."""

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(LikePostHandlerTest, cls).setUp()
        app = cls.webapp2.WSGIApplication(
            [("/api/posts/(.*)/likes", LikeHandler),], debug=True
        )
        cls.testapp = cls.webtest.TestApp(app)
        
        # models creation
        # new User User
        cls.user = mocks.create_user('user@example.com')
        # new User Other User
        cls.other_user = mocks.create_user('otheruser@example.com')
        # new Institution SPLAB
        cls.institution = mocks.create_institution()
        cls.user.add_institution(cls.institution.key)
        cls.other_user.add_institution(cls.institution.key)
        # new Post
        cls.post = mocks.create_post(cls.user.key, cls.institution.key)


    @patch('utils.verify_token', return_value={'email': 'otheruser@example.com'})
    def test_get(self, verify_token):
        """Test method get of LikeHandler."""
        uri = '/api/posts/%s/likes' % self.post.key.urlsafe()

        # Call the get method
        data = self.testapp.get(uri)
        # Verify the status of request
        self.assertEqual(data.status, '200 OK')
        # Get the body of request
        likes = json.loads(data.body)
        # Get the key of authors of likes
        authors = [like['author'].split('/')[-1] for like in likes]
        # Checks if the key of Other User are not in the authors
        self.assertNotIn(self.other_user.key.urlsafe(), authors)
        # Call the post method
        self.testapp.post_json(uri, {},
            headers={'institution-authorization': self.institution.key.urlsafe()})
        # Verify if after the like the number of likes at post is 1
        self.post = self.post.key.get()
        self.assertEqual(self.post.get_number_of_likes(), 1,
                         "The number of likes expected was 1, but was %d"
                         % self.post.get_number_of_likes())
        # Call the get method
        data = self.testapp.get(uri)
        # Verify the status of request
        self.assertEqual(data.status, '200 OK')
        # Get the body of request
        likes = json.loads(data.body)
        # Get the key of authors of likes
        authors = [like['author'].split('/')[-1] for like in likes]
        # Checks if the key of Other User are in the authors
        self.assertIn(self.other_user.name, authors)

    @patch('handlers.like_handler.enqueue_task')
    @patch('utils.verify_token', return_value={'email': 'otheruser@example.com'})
    def test_post(self, verify_token, enqueue_task):
        """Test the like_handler's post method when a post is liked."""
        uri = '/api/posts/%s/likes' % self.post.key.urlsafe()
        # Verify if before the like the number of likes at post is 0
        self.assertEqual(self.post.get_number_of_likes(), 0,
                         "The number of likes expected was 0, but it was %d"
                         % self.post.get_number_of_likes())
        # Call the post method
        self.testapp.post_json(uri, {},
            headers={'institution-authorization': self.institution.key.urlsafe()})
        # Verify if after the like the number of likes at post is 1
        self.post = self.post.key.get()
        self.assertEqual(self.post.get_number_of_likes(), 1,
                         "The number of likes expected was 1, but was %d"
                         % self.post.get_number_of_likes())
        # assert the notification was sent
        params = {
            'receiver_key': self.post.author.urlsafe(),
            'sender_key': self.other_user.key.urlsafe(),
            'entity_key': self.post.key.urlsafe(),
            'entity_type': 'LIKE_POST',
            'current_institution': self.institution.key.urlsafe(),
            'sender_institution_key': self.post.institution.urlsafe()
        }

        enqueue_task.assert_called_with('post-notification', params)

        # Call the post method again
        with self.assertRaises(Exception) as exc:
            self.testapp.post_json(uri, {},
            headers={'institution-authorization': self.institution.key.urlsafe()})
        # Verify if message exception
        exc = self.get_message_exception(exc.exception.message)
        self.assertEquals(exc, "Error! User already liked this publication")
        # Refresh post
        self.post = self.post.key.get()
        # Verify if after the other like the number of likes at post is 1 yet
        self.assertEqual(self.post.get_number_of_likes(), 1,
                         "The number of likes expected was 1, but was %d"
                         % self.post.get_number_of_likes())
        # Authentication with User
        verify_token.return_value = {'email': 'user@example.com'}
        # Call the post method
        self.testapp.post_json(uri, {},
            headers={'institution-authorization': self.institution.key.urlsafe()})
        # Refresh post
        self.post = self.post.key.get()
        # Verify if after the like with other user the number of likes at
        # post is 2
        self.assertEqual(self.post.get_number_of_likes(), 2,
                         "The number of likes expected was 2, but was %d"
                         % self.post.get_number_of_likes())

    @patch('utils.verify_token', return_value={'email': 'otheruser@example.com'})
    def test_post_deleted_post(self, verify_token):
        institution = mocks.create_institution()
        user = mocks.create_user()
        institution.add_member(user)
        user.add_institution(institution.key)
        post = mocks.create_post(user.key, institution.key)

        post.delete(user)

        with self.assertRaises(Exception) as raises_context:
            self.testapp.post('/api/posts/%s/likes' % post.key.urlsafe(),
            headers={'institution-authorization': self.institution.key.urlsafe()})
        
        exception_message = self.get_message_exception(str(raises_context.exception))
        self.assertEqual(
            exception_message, 
            'Error! This post has been deleted',
            'Expected message of exception must be equal to Error! This post has been deleted'
        )

    @patch('utils.verify_token', return_value={'email': 'otheruser@example.com'})
    def test_delete(self, verify_token):
        """Test the like_post_handler's delete method."""
        uri = '/api/posts/%s/likes' % self.post.key.urlsafe()
        # Call the post method
        self.testapp.post_json(uri, {},
            headers={'institution-authorization': self.institution.key.urlsafe()})
        # Refresh post
        self.post = self.post.key.get()
        # Verify if after the like the number of likes at post is 1
        self.assertEqual(self.post.get_number_of_likes(), 1,
                         "The number of likes expected was 1, but was %d"
                         % self.post.get_number_of_likes())
        # Call the delete method
        self.testapp.delete(uri)
        # Refresh post
        self.post = self.post.key.get()
        # Verify if after the dislike the number of likes at post is 0
        self.assertEqual(self.post.get_number_of_likes(), 0,
                         "The number of likes expected was 0, but was %d"
                         % self.post.get_number_of_likes())
        # Call the delete method again
        with self.assertRaises(Exception) as ex:
            self.testapp.delete(uri)
        # Verify if message exception
        ex = self.get_message_exception(ex.exception.message)
        self.assertEquals(ex, "Error! User hasn't liked this publication.")
        # Refresh post
        self.post = self.post.key.get()
        # Verify if after the other dislike the number of likes at post is 0
        self.assertEqual(self.post.get_number_of_likes(), 0,
                         "The number of likes expected was 0, but was %d"
                         % self.post.get_number_of_likes())

    def tearDown(cls):
        """Deactivate the test."""
        cls.test.deactivate()
