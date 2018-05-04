# -*- coding: utf-8 -*-
"""Like Reply handler test."""
import json
import mocks

from test_base_handler import TestBaseHandler
from handlers.like_handler import LikeHandler

from mock import patch


class LikeReplyHandlerTest(TestBaseHandler):
    """Test the handler like_post_handler."""

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(LikeReplyHandlerTest, cls).setUp()
        app = cls.webapp2.WSGIApplication(
            [("/api/posts/(.*)/comments/(.*)/replies/(.*)/likes", LikeHandler),], debug=True
        )
        cls.testapp = cls.webtest.TestApp(app)
        init(cls)

    @patch('utils.verify_token', return_value={'email': 'otheruser@example.com'})
    def test_get(self, verify_token):
        """Test the like_comment_handler's get method."""
        # like the comment
        body = { "currentInstitution": {"name": "instName"} }
        self.testapp.post_json(self.uri, body)
        # Call the get method
        data = self.testapp.get(self.uri)
        # Verify the status of request
        self.assertEqual(data.status, '200 OK')
        # Get the body of request
        likes = json.loads(data.body)
        # assert the comment has one like
        self.assertEquals(
            len(likes), 1,
            "The reply should have one like"
        )

    @patch('handlers.like_handler.send_message_notification')
    @patch('utils.verify_token', return_value={'email': 'user@example.com'})
    def test_post(self, verify_token, send_message_notification):
        """Test post method when the user likes a comment."""
        # Call the get method again
        data = self.testapp.get(self.uri)
        # Get the body of request
        likes = json.loads(data.body)
        # assert the comment has no likes
        self.assertEquals(
            len(likes), 0,
            "This reply should have no like."
        )
        # Call the post method
        self.testapp.post_json(self.uri, {})
        # Call the get method again
        data = self.testapp.get(self.uri)
        # Get the body of request
        likes = json.loads(data.body)
        self.assertEquals(
            len(likes), 1,
            "This reply should have one like."
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
                "name": None 
            }
        }

        # assert the notification was sent
        send_message_notification.assert_called_with(
            receiver_key=self.other_user.key.urlsafe(),
            entity_type="LIKE_COMMENT",
            entity_key=self.post.key.urlsafe(),
            message=json.dumps(message)
        )

        # Call the post method again
        with self.assertRaises(Exception) as exc:
            self.testapp.post_json(self.uri, {})
        # Verify the exception message
        exc = self.get_message_exception(exc.exception.message)
        self.assertEquals(exc, "Error! User already liked this comment")
        # Call the get method again
        data = self.testapp.get(self.uri)
        # Get the body of request
        likes = json.loads(data.body)
        # Verify the number of likes in comment
        self.assertEqual(
            len(likes), 1,
            "The number of likes should be 1, but it was %d" % len(likes)
        )
        
    @patch('utils.verify_token', return_value={'email': 'otheruser@example.com'})
    def test_delete(self, verify_token):
        """Test the like_comment_handler's delete method."""
        # like the reply
        body = { "currentInstitution": {"name": "instName"} }
        self.testapp.post_json(self.uri, body)
        # update the post obj
        self.post = self.post.key.get()
        # Call the get method again
        data = self.testapp.get(self.uri)
        # Get the body of request
        likes = json.loads(data.body)
        # assert the comment has one likes
        self.assertEquals(
            len(likes), 1,
            "This reply should have one like."
        )
        # call the delete method
        self.testapp.delete(self.uri)
        # update the post obj
        self.post = self.post.key.get()
        # Call the get method again
        data = self.testapp.get(self.uri)
        # Get the body of request
        likes = json.loads(data.body)
        # assert the comment has one likes
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
        # update the post obj
        self.post = self.post.key.get()
        # Call the get method again
        data = self.testapp.get(self.uri)
        # Get the body of request
        likes = json.loads(data.body)
        # assert the comment has one likes
        self.assertEquals(
            len(likes), 0,
            "The comment should have no like"
        )

    def tearDown(cls):
        """Deactivate the test."""
        cls.test.deactivate()


def init(cls):
    """Init the models."""
    # new Users
    cls.user = mocks.create_user('user@example.com')
    cls.other_user = mocks.create_user('otheruser@example.com')
    cls.third_user = mocks.create_user('thirduser@example.com')
    # new Institution
    cls.institution = mocks.create_institution()
    # Post of User
    cls.post = mocks.create_post(cls.user.key, cls.institution.key)
    # comment
    cls.comment = mocks.create_comment(cls.institution.key.urlsafe(), cls.third_user)
    # reply
    cls.reply = mocks.create_comment(cls.institution.key.urlsafe(), cls.other_user)
    # add comment to post
    cls.post.add_comment(cls.comment)
    # add reply to comment
    cls.post = cls.post.key.get()
    cls.post.reply_comment(cls.reply, cls.comment.id)

    cls.uri = '/api/posts/%s/comments/%s/replies/%s/likes' % (
            cls.post.key.urlsafe(), cls.comment.id, cls.reply.id
        )
