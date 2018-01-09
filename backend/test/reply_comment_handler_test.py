# -*- coding: utf-8 -*-
"""Post handler test."""

from test_base_handler import TestBaseHandler
from models.post import Post
from models.user import User
from models.institution import Institution
from models.post import Comment
from handlers.reply_comment_handler import ReplyCommentHandler

from mock import patch

from utils import Utils

import json


class ReplyCommentHandlerTest(TestBaseHandler):
    """Test the post_handler class."""

    USER_DATA = {'email': 'user@example.com'}

    URL_REPLY_COMMENT = "/api/posts/%s/comments/%s/replies"
    URL_DELETE_REPLY = "/api/posts/%s/comments/%s/replies/%s"

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
        initModels(cls)

    @patch('utils.verify_token', return_value=USER_DATA)
    def test_post(self, verify_token):
        """Reply a comment of post"""
        # Verify size of list
        user_comment = self.user_post.get_comment(self.comment.id)
        self.assertEquals(len(user_comment.get('replies')), 0,
                          "Expected size of replies list should be zero")

        # Call the post method
        body = {
            'replyData': {
                "text": "reply of comment",
                "institution_key": self.institution.key.urlsafe()
            },
            'currentInstitution': {
                'name': 'currentInstitution'
            }
        }
        self.testapp.post(self.URL_REPLY_COMMENT %
            (self.user_post.key.urlsafe(), self.comment.id),
                          json.dumps(body))

        # Update post
        self.user_post = self.user_post.key.get()

        # Verify size of list
        user_comment = self.user_post.get_comment(self.comment.id)
        self.assertEquals(len(user_comment.get('replies')), 1,
                          "Expected size of comment's list should be one")

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
            self.testapp.post(self.URL_REPLY_COMMENT % (self.user_post.key.urlsafe(), comment_id),
                              json.dumps(body))

        exception_message = self.get_message_exception(str(raises_context.exception))
        self.assertEqual(
            exception_message,
            "Error! This post has been deleted",
            "Expected exception message must be equal to " +
            "Error! This post has been deleted")

    @patch('utils.verify_token', return_value=USER_DATA)
    def test_delete(self, verify_token):
        """Delete a reply of a comment"""
        # Verify if before the delete the post's state is published
        self.assertEqual(self.user_post.state, 'published',
                         "The post's state must be published")

        reply = Comment.create({
            "text": "reply",
            "institution_key": self.institution.key.urlsafe()
        }, self.user)

        user_comment = self.user_post.get_comment(self.comment.id)
        user_comment.get('replies')[reply.id] = Utils.toJson(reply)

        self.user_post.put()

        user_comment = self.user_post.key.get().get_comment(self.comment.id)
        self.assertEquals(len(user_comment.get('replies')), 1,
                          "Expected size of replies list should be one")

        # Call the delete method
        self.testapp.delete(self.URL_DELETE_REPLY % (
            self.user_post.key.urlsafe(),
            self.comment.id,
            reply.id
        ))

        user_comment = self.user_post.key.get().get_comment(self.comment.id)
        self.assertEquals(len(user_comment.get('replies')), 0,
                          "Expected size of replies list should be zero")

    def tearDown(cls):
        """Deactivate the test."""
        cls.test.deactivate()


def initModels(cls):
    """Init the models."""
    # new User User
    cls.user = User()
    cls.user.name = 'User'
    cls.user.email = ['user@example.com']
    cls.user.put()
    # new User Test User
    cls.test_user = User()
    cls.test_user.name = 'Test User'
    cls.test_user.email = ['testuser@example.com']
    cls.test_user.photo_url = '/image.jpg'
    cls.test_user.put()
    # new Institution CERTBIO
    cls.institution = Institution()
    cls.institution.name = 'Institution'
    cls.institution.put()
    # POST of User To Certbio Institution
    cls.user_post = Post()
    cls.user_post.author = cls.user.key
    cls.user_post.institution = cls.institution.key
    cls.user_post.put()
    # comment
    cls.comment = Comment.create({"text": "comment",
        "institution_key": cls.institution.key.urlsafe()}, cls.user)
    cls.user_post.add_comment(cls.comment)
    cls.user_post.put()
