# -*- coding: utf-8 -*-
"""Post Comment handler test."""

import json
import mocks

from test_base_handler import TestBaseHandler
from custom_exceptions.notAuthorizedException import NotAuthorizedException
from handlers.post_comment_handler import PostCommentHandler
from handlers.post_comment_handler import check_permission
from models import User
from models import Institution
from models import Post

from mock import patch

USER_EMAIL = 'user@email.com'
OTHER_USER_EMAIL = 'other_usero@email.com'

URL_POST_COMMENT = "/api/posts/%s/comments"
URL_DELETE_COMMENT = "/api/posts/%s/comments/%s"

class PostCommentHandlerTest(TestBaseHandler):
    """Post Comment handler test."""

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(PostCommentHandlerTest, cls).setUp()
        app = cls.webapp2.WSGIApplication(
            [("/api/posts/(.*)/comments/(.*)", PostCommentHandler),
             ("/api/posts/(.*)/comments", PostCommentHandler)
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)
        
        # Create models
        # new User
        cls.user = mocks.create_user(USER_EMAIL)
        # new User
        cls.other_user = mocks.create_user(OTHER_USER_EMAIL)
        # new Institution
        cls.institution = mocks.create_institution()
        cls.institution.members = [cls.user.key]
        cls.institution.followers = [cls.user.key]
        cls.institution.admin = cls.user.key
        cls.institution.put()
        cls.user.add_institution(cls.institution.key)
        cls.other_user.add_institution(cls.institution.key)
        # POST of user To institution 
        cls.user_post = mocks.create_post(cls.user.key, cls.institution.key)
        # Comments
        cls.comment = {'text': 'Frist comment. Using in Test', 'institution_key': cls.institution.key.urlsafe()}
        cls.other_comment = {'text': 'Second comment. Using in Test', 'institution_key': cls.institution.key.urlsafe()}
        # http post body
        cls.body = {
            'commentData': cls.comment
        }

    @patch('handlers.post_comment_handler.enqueue_task')
    @patch('util.login_service.verify_token', return_value={'email': OTHER_USER_EMAIL})
    def test_post(self, verify_token, enqueue_task):
        """Other_user's comment on user's post."""
        # Verify size of list
        self.assertEquals(len(self.user_post.comments), 0,
                          "Expected size of comment's list should be zero")

        # Call the post method
        self.testapp.post_json(
            URL_POST_COMMENT % self.user_post.key.urlsafe(),
            self.body,
            headers={'institution-authorization': self.institution.key.urlsafe()}
        )

        # Update post
        self.user_post = self.user_post.key.get()

        # Verify size of list
        self.assertEquals(len(self.user_post.comments), 1,
                          "Expected size of comment's list should be one")

        # assert the notification was sent
        params = {
            'receiver_key': self.user_post.author.urlsafe(),
            'sender_key': self.other_user.key.urlsafe(),
            'entity_key': self.user_post.key.urlsafe(),
            'entity_type': 'COMMENT',
            'current_institution': self.institution.key.urlsafe(),
            'sender_institution_key': self.user_post.institution.urlsafe()
        }
        enqueue_task.assert_called_with('post-notification', params)

        # Verify that the post is published
        self.assertEquals(self.user_post.state, "published")

        # Delete the post
        self.user_post.state = 'deleted'
        self.user_post.put()

        # Verify if the post is deleted
        self.assertEquals(self.user_post.state, "deleted")

        # Assert that Exception is raised when the user try
        # to comment a deleted post
        exception_message = "Error! This post has been deleted"
        self.body['commentData'] = self.other_comment
        with self.assertRaises(Exception) as raises_context:
            self.testapp.post_json(
                URL_POST_COMMENT % self.user_post.key.urlsafe(),
                self.body
            )
        raises_context_message = self.get_message_exception(raises_context.exception.message)
        self.assertEquals(
            raises_context_message,
            exception_message,
            "Expected: " + exception_message + ". But got: " + raises_context_message)


    @patch('handlers.post_comment_handler.enqueue_task')
    @patch('util.login_service.verify_token', return_value={'email': USER_EMAIL})
    def test_post_ownerpost(self, verify_token, enqueue_task):
        """Owner user comments on its own Post."""
        # Verify size of list
        self.assertEquals(len(self.user_post.comments), 0,
                          "Expected size of comment's list should be zero")

        # Call the post method
        self.body['commentData'] = self.other_comment
        self.testapp.post_json(
            URL_POST_COMMENT % self.user_post.key.urlsafe(),
            self.body
        )

        # Update post
        self.user_post = self.user_post.key.get()

        # Verify size of list
        self.assertEquals(len(self.user_post.comments), 1,
                          "Expected size of comment's list should be one")

        # assert the notification was not sent
        enqueue_task.assert_not_called()

    @patch('util.login_service.verify_token', return_value={'email': OTHER_USER_EMAIL})
    def test_delete(self, verify_token):
        """User can delete your comment in Post."""
        # Added comment
        self.response = self.testapp.post_json(
            URL_POST_COMMENT % self.user_post.key.urlsafe(),
            self.body,
            headers={'institution-authorization': self.institution.key.urlsafe()}
        ).json
        # ID of comment
        self.id_comment = self.response["id"]
        self.user_post = self.user_post.key.get()
        self.assertEquals(len(self.user_post.comments), 1,
                          "Expected size of comment's list should be one")

        # Call the delete method
        self.testapp.delete(URL_DELETE_COMMENT %
                            (self.user_post.key.urlsafe(), self.id_comment))

        # Update post
        self.user_post = self.user_post.key.get()

        # Verify size of list
        self.assertEquals(len(self.user_post.comments), 0,
                          "Expected size of comment's list should be zero")

    @patch('util.login_service.verify_token', return_value={'email': OTHER_USER_EMAIL})
    def test_delete_in_deleted_post(self, verify_token):
        """User can not delete comment in deleted Post."""
        # Added comment
        self.response = self.testapp.post_json(
            URL_POST_COMMENT % self.user_post.key.urlsafe(),
            self.body,
            headers={'institution-authorization': self.institution.key.urlsafe()}
        ).json
        # ID of comment
        self.id_comment = self.response["id"]
        self.user_post = self.user_post.key.get()
        self.assertEquals(len(self.user_post.comments), 1,
                          "Expected size of comment's list should be one")
        # Set state of posto to deleted
        self.user_post.state = 'deleted'
        self.user_post.put()
        # Call delete method with post on deleted state
        exception_message = "Error! Can not delete comment in deleted post"
        with self.assertRaises(Exception) as raises_context:
            self.testapp.delete(URL_DELETE_COMMENT %
                                (self.user_post.key.urlsafe(), self.id_comment))

        raises_context_message = self.get_message_exception(raises_context.exception.message)
        self.assertEquals(
            raises_context_message,
            exception_message,
            "Expected: " + exception_message + ". But got: " + raises_context_message)
        self.assertEquals(len(self.user_post.comments), 1,
                          "Expected size of comment's list should be one")

    @patch('util.login_service.verify_token', return_value={'email': USER_EMAIL})
    def test_delete_simpleuser(self, verify_token):
        """An simple user can't delete comments by other users in Post."""
        # Added comment of user
        self.response = self.testapp.post_json(
            URL_POST_COMMENT % self.user_post.key.urlsafe(),
            self.body
        ).json
        # ID of comment
        self.id_comment = self.response["id"]
        self.user_post = self.user_post.key.get()
        self.assertEquals(len(self.user_post.comments), 1,
                          "Expected size of comment's list should be one")

        # Pretend an authentication
        verify_token.return_value={'email': OTHER_USER_EMAIL}

        # User other_user call the delete method
        exception_message = "Error! User not allowed to remove comment"
        with self.assertRaises(Exception) as raises_context:
            self.testapp.delete(URL_DELETE_COMMENT %
                                (self.user_post.key.urlsafe(), self.id_comment))

        raises_context_message = self.get_message_exception(raises_context.exception.message)
        self.assertEquals(
            raises_context_message,
            exception_message,
            "Expected: " + exception_message + ". But got: " + raises_context_message)
        self.assertEquals(len(self.user_post.comments), 1,
                          "Expected size of comment's list should be one")

    @patch('util.login_service.verify_token', return_value={'email': OTHER_USER_EMAIL})
    def test_delete_ownerpost(self, verify_token):
        """Owner user can delete comment from other user in Post."""
        # Added comment user other_user
        self.body['commentData'] = self.other_comment
        self.response = self.testapp.post_json(
            URL_POST_COMMENT % self.user_post.key.urlsafe(),
            self.body,
            headers={'institution-authorization': self.institution.key.urlsafe()}
        ).json
        # ID of comment
        self.id_other_comment = self.response["id"]
        self.user_post = self.user_post.key.get()
        self.assertEquals(len(self.user_post.comments), 1,
                          "Expected size of comment's list should be one")

        # Call the delete method
        self.testapp.delete(URL_DELETE_COMMENT %
                            (self.user_post.key.urlsafe(), self.id_other_comment))

        # Update post
        self.user_post = self.user_post.key.get()

        # Verify size of list
        self.assertEquals(len(self.user_post.comments), 0,
                          "Expected size of comment's list should be zero")

    @patch('util.login_service.verify_token', return_value={'email': USER_EMAIL})
    def test_check_permission(self, verify_token):
        """Test method check_permission in post_comment_handler."""
        # Added comment
        self.response = self.testapp.post_json(
            URL_POST_COMMENT % self.user_post.key.urlsafe(),
            self.body
        ).json

        # When other_user try delete comment from user.
        with self.assertRaises(NotAuthorizedException):
            check_permission(self.other_user, self.institution, self.user_post, self.body)
