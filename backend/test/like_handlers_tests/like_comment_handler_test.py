# -*- coding: utf-8 -*-
"""Like Comment handler test."""
import json
import mocks

from test_base_handler import TestBaseHandler
from handlers.like_handler import LikeHandler

from mock import patch


class LikeCommentHandlerTest(TestBaseHandler):
    """Test the handler like_post_handler."""

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(LikeCommentHandlerTest, cls).setUp()
        app = cls.webapp2.WSGIApplication(
            [("/api/posts/(.*)/comments/(.*)/likes", LikeHandler),], debug=True
        )
        cls.testapp = cls.webtest.TestApp(app)
        
        # mocking entities
        # new Users
        cls.user = mocks.create_user('user@example.com')
        cls.other_user = mocks.create_user('otheruser@example.com')
        cls.third_user = mocks.create_user('thirduser@example.com')
        # new Institution
        cls.institution = mocks.create_institution()
        cls.user.add_institution(cls.institution.key)
        cls.other_user.add_institution(cls.institution.key)
        # Post of User
        cls.post = mocks.create_post(cls.user.key, cls.institution.key)
        # comment
        cls.comment = mocks.create_comment(cls.institution.key.urlsafe(), cls.third_user)
        # add comment to post
        cls.post.add_comment(cls.comment)
        cls.post = cls.post.key.get()
        
        # creating uri
        cls.uri = '/api/posts/%s/comments/%s/likes' % (cls.post.key.urlsafe(), cls.comment.id)

    @patch('util.login_service.verify_token', return_value={'email': 'otheruser@example.com'})
    def test_get(self, verify_token):
        """Test the like_comment_handler's get method."""
        # like the comment
        self.testapp.post_json(self.uri, {},
            headers={'institution-authorization': self.institution.key.urlsafe()})
        # Call the get method
        data = self.testapp.get(self.uri)
        # Verify the status of request
        self.assertEqual(data.status, '200 OK')
        # Get the body of request
        likes = json.loads(data.body)
        # assert the comment has one like
        self.assertEquals(
            len(likes), 1,
            "The comment should have one like"
        )

    @patch('handlers.like_handler.send_message_notification')
    @patch('util.login_service.verify_token', return_value={'email': 'user@example.com'})
    def test_post(self, verify_token, send_message_notification):
        """Test post method when the user likes a comment."""
        # assert the comment has no likes
        post_comment = self.post.comments.get(self.comment.id)
        self.assertEquals(
            len(post_comment.get('likes')), 0,
            "This comment should have no like."
        )
        # Call the post method
        self.testapp.post_json(self.uri, {},
            headers={'institution-authorization': self.institution.key.urlsafe()})
        # update the post obj
        self.post = self.post.key.get()
        # assert the comment has one likes
        post_comment = self.post.comments.get(self.comment.id)
        self.assertEquals(
            len(post_comment.get('likes')), 1,
            "This comment should have one like."
        )

        message = {
            "from": {
                "photo_url": self.user.photo_url,
                "name": self.user.name,
                "institution_name": self.post.institution.get().name
            },
            "to": {
                "institution_name": ""
            },
            "current_institution": {
                "name": self.institution.name
            }
        }

        # assert the notification was sent
        send_message_notification.assert_called_with(
            receiver_key=self.third_user.key.urlsafe(),
            notification_type="LIKE_COMMENT",
            entity_key=self.post.key.urlsafe(),
            message=json.dumps(message)
        )

        # Call the post method again
        with self.assertRaises(Exception) as exc:
            self.testapp.post_json(self.uri, {},
                headers={'institution-authorization': self.institution.key.urlsafe()})
        # Verify the exception message
        exc = self.get_message_exception(exc.exception.message)
        self.assertEquals(exc, "Error! User already liked this comment")
        # Refresh post
        self.post = self.post.key.get()
        # get the comment
        comment = self.post.get_comment(self.comment.id)
        # Verify the number of likes in comment
        self.assertEqual(
            len(comment['likes']), 1,
            "The number of likes should be 1, but it was %d" % len(comment['likes'])
        )
        
    @patch('util.login_service.verify_token', return_value={'email': 'otheruser@example.com'})
    def test_delete(self, verify_token):
        """Test the like_comment_handler's delete method."""
        # like the comment
        body = { "currentInstitution": {"name": "instName"} }
        self.testapp.post_json(self.uri, body)
        # Call the get method
        data = self.testapp.get(self.uri)
        # Get the body of request
        likes = json.loads(data.body)
        # assert the comment has one like
        self.assertEquals(
            len(likes), 1,
            "The comment should have one like"
        )
        # call the delete method
        self.testapp.delete(self.uri)
        # Call the get method again
        data = self.testapp.get(self.uri)
        # Get the body of request
        likes = json.loads(data.body)
        # assert the comment has one like
        self.assertEquals(
            len(likes), 0,
            "The comment should have no like"
        )

        # Call the delete method again
        with self.assertRaises(Exception) as ex:
            self.testapp.delete(self.uri)
        # Verify exception message
        ex = self.get_message_exception(ex.exception.message)
        self.assertEquals(ex, "Error! User hasn't liked this comment.")
        # Refresh the comment's likes
        data = self.testapp.get(self.uri)
        # Get the body of request
        likes = json.loads(data.body)
        # assert the comment has one like
        self.assertEquals(
            len(likes), 0,
            "The number of likes should be zero, but it was %s" % len(likes)
        )

    def tearDown(cls):
        """Deactivate the test."""
        cls.test.deactivate()
