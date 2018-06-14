# -*- coding: utf-8 -*-
"""Post handler test."""

import json
from .. import mocks

from ..test_base_handler import TestBaseHandler
from models import Post
from models import User
from models import Institution
from models import Comment
from handlers.reply_comment_handler import ReplyCommentHandler

from mock import patch, call
from utils import Utils

USER_EMAIL = "user@email.com"
OTHER_USER_EMAIL = "otheruser@email.com"
THIRD_USER_EMAIL = "thirduser@email.com"

URL_REPLY_COMMENT = "/api/posts/%s/comments/%s/replies"
URL_DELETE_REPLY = "/api/posts/%s/comments/%s/replies/%s"

class ReplyCommentHandlerTest(TestBaseHandler):
    """Test the post_handler class."""

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(ReplyCommentHandlerTest, cls).setUp()
        methods = set(cls.webapp2.WSGIApplication.allowed_methods)
        methods.add('PATCH')
        cls.webapp2.WSGIApplication.allowed_methods = frozenset(methods)
        app = cls.webapp2.WSGIApplication([
            ("/api/posts/(.*)/comments/(.*)/replies", ReplyCommentHandler),
            ("/api/posts/(.*)/comments/(.*)/replies/(.*)", ReplyCommentHandler)
        ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)

        # create models
        # new User
        cls.user = mocks.create_user(USER_EMAIL)
        # other user
        cls.other_user = mocks.create_user(OTHER_USER_EMAIL)
        # third user
        cls.third_user = mocks.create_user(THIRD_USER_EMAIL)
        # new Institution CERTBIO
        cls.institution = mocks.create_institution()
        cls.third_user.add_institution(cls.institution.key)
        # POST of User To Certbio Institution
        cls.user_post = mocks.create_post(cls.user.key, cls.institution.key)
        # comment from other_user
        cls.other_user_comment = mocks.create_comment(cls.institution.key.urlsafe(), cls.other_user)
        # reply from third_user
        cls.reply = mocks.create_comment(cls.institution.key.urlsafe(), cls.third_user)
        # add comment to post
        cls.user_post.add_comment(cls.other_user_comment)
        cls.user_post = cls.user_post.key.get()
        cls.user_post.put()


    @patch('handlers.reply_comment_handler.send_message_notification')
    @patch('util.login_service.verify_token', return_value={'email': THIRD_USER_EMAIL})
    def test_post(self, verify_token, send_message_notification):
        """Reply a comment of post"""
        # Verify size of list
        other_user_comment = self.user_post.get_comment(self.other_user_comment.id)
        self.assertEquals(len(other_user_comment.get('replies')), 0,
                          "Expected size of replies list should be zero")

        # Call the post method
        body = {
            'replyData': {
                "text": "reply of comment",
                "institution_key": self.institution.key.urlsafe()
            }
        }

        self.testapp.post_json(
            URL_REPLY_COMMENT % (self.user_post.key.urlsafe(), self.other_user_comment.id),
            body, headers={'institution-authorization': self.institution.key.urlsafe()}
        )

        # Update post
        self.user_post = self.user_post.key.get()

        # Verify size of list
        other_user_comment = self.user_post.get_comment(self.other_user_comment.id)
        self.assertEquals(
            len(other_user_comment.get('replies')), 1,
            "Expected size of comment's list should be one"
        )

        message = {
            "from": {
                "photo_url": self.third_user.photo_url,
                "name": self.third_user.name,
                "institution_name": self.user_post.institution.get().name
            },
            "to": {
                "institution_name": ""
            },
            "current_institution": {
                "name": self.institution.name
            }
        }

        calls = [
            # args used to send the notification to the post author
            call(
                receiver_key=self.user.key.urlsafe(),
                notification_type="COMMENT",
                entity_key=self.user_post.key.urlsafe(),
                message=json.dumps(message)
            ),
            # args used to send the notification to the author 
            # from the comment that was replyed
            call(
                receiver_key=self.other_user.key.urlsafe(),
                notification_type="REPLY_COMMENT",
                entity_key=self.user_post.key.urlsafe(),
                message=json.dumps(message)
            )
        ]
        send_message_notification.assert_has_calls(calls)
    
    @patch('handlers.reply_comment_handler.send_message_notification')
    @patch('util.login_service.verify_token', return_value={'email': THIRD_USER_EMAIL})
    def test_post_method_on_deleted_post(self, verify_token, send_message_notification):
        """Test post a comment when the post is deleted."""
        body = {
            'replyData': {
                "text": "reply of comment",
                "institution_key": self.institution.key.urlsafe()
            }
        }
        # Verify that the post is published
        self.assertEquals(self.user_post.state, "published")

        # Delete the post
        self.user_post.state = 'deleted'
        self.user_post.put()

        # Verify if the post is deleted
        self.assertEquals(self.user_post.state, "deleted")

        # Assert that Exception is raised when the user try
        # to comment a deleted post
        with self.assertRaises(Exception) as raises_context:
            comment_id = 21456
            self.testapp.post_json(
                URL_REPLY_COMMENT % (self.user_post.key.urlsafe(), comment_id), body,
                headers={'institution-authorization': self.institution.key.urlsafe()}
            )

        exception_message = self.get_message_exception(str(raises_context.exception))
        expected_message = "Error! This post has been deleted"
        self.assertEqual(
            exception_message,
            expected_message,
            "Expected exception message must be equal to %s but was %s" %
            (expected_message, exception_message))
        # assert no notification was sent
        send_message_notification.assert_not_called()

    @patch('util.login_service.verify_token', return_value={'email': USER_EMAIL})
    def test_delete(self, verify_token):
        """Delete a reply of a comment"""
        # Verify if before the delete the post's state is published
        self.assertEqual(self.user_post.state, 'published',
                         "The post's state must be published")

        reply = Comment.create({
            "text": "reply",
            "institution_key": self.institution.key.urlsafe()
        }, self.user)

        other_user_comment = self.user_post.get_comment(self.other_user_comment.id)
        other_user_comment.get('replies')[reply.id] = Utils.toJson(reply)

        self.user_post.put()

        other_user_comment = self.user_post.key.get().get_comment(self.other_user_comment.id)
        self.assertEquals(len(other_user_comment.get('replies')), 1,
                          "Expected size of replies list should be one")

        # Call the delete method
        self.testapp.delete(URL_DELETE_REPLY % (
            self.user_post.key.urlsafe(),
            self.other_user_comment.id,
            reply.id
        ))

        other_user_comment = self.user_post.key.get().get_comment(self.other_user_comment.id)
        self.assertEquals(len(other_user_comment.get('replies')), 0,
                          "Expected size of replies list should be zero")

    def tearDown(cls):
        """Deactivate the test."""
        cls.test.deactivate()
