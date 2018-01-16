# -*- coding: utf-8 -*-
"""Post Comment handler test."""

from test_base_handler import TestBaseHandler
from custom_exceptions.notAuthorizedException import NotAuthorizedException
from handlers.post_comment_handler import PostCommentHandler
from handlers.post_comment_handler import check_permission
from models.user import User
from models.institution import Institution
from models.post import Post

from mock import patch
import mocks

user_email = 'userbeel@gmail.com'
other_user_email = 'other_user.brito@ccc.ufcg.edu.br'


class PostCommentHandlerTest(TestBaseHandler):
    """Post Comment handler test."""

    URL_POST_COMMENT = "/api/posts/%s/comments"
    URL_DELETE_COMMENT = "/api/posts/%s/comments/%s"


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
        cls.user = mocks.create_user(user_email)
        cls.user.put()
        # new User
        cls.other_user = mocks.create_user(other_user_email)
        cls.other_user.put()
        # new Institution
        cls.institution = mocks.create_institution()
        cls.institution.members = [cls.user.key]
        cls.institution.followers = [cls.user.key]
        cls.institution.admin = cls.user.key
        cls.institution.put()
        # POST of user To institution 
        cls.user_post = mocks.create_post(cls.user.key, cls.institution.key)
        cls.user_post.put()
        # Comments
        cls.comment = {'text': 'Frist comment. Using in Test', 'institution_key': cls.institution.key.urlsafe()}
        cls.other_comment = {'text': 'Second comment. Using in Test', 'institution_key': cls.institution.key.urlsafe()}
        # http post body
        cls.body = {
            'commentData': cls.comment,
            'currentInstitution': {
                'name': cls.institution.name
            }
        }

    @patch('utils.verify_token', return_value={'email': other_user_email})
    def test_post(self, verify_token):
        """Another user comment in Post of user."""
        # Verify size of list
        self.assertEquals(len(self.user_post.comments), 0,
                          "Expected size of comment's list should be zero")

        # Call the post method
        self.testapp.post_json(
            self.URL_POST_COMMENT % self.user_post.key.urlsafe(),
            self.body
        )

        # Update post
        self.user_post = self.user_post.key.get()

        # Verify size of list
        self.assertEquals(len(self.user_post.comments), 1,
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
        exception_message = "Error! This post has been deleted"
        self.body['commentData'] = self.other_comment
        with self.assertRaises(Exception) as raises_context:
            self.testapp.post_json(
                self.URL_POST_COMMENT % self.user_post.key.urlsafe(),
                self.body
            )
        raises_context_message = self.get_message_exception(raises_context.exception.message)
        self.assertEquals(
            raises_context_message,
            exception_message,
            "Expected: " + exception_message + ". But got: " + raises_context_message)

    @patch('utils.verify_token', return_value={'email': user_email})
    def test_post_ownerpost(self, verify_token):
        """Owner user comment in Post."""
        # Verify size of list
        self.assertEquals(len(self.user_post.comments), 0,
                          "Expected size of comment's list should be zero")

        # Call the post method
        self.body['commentData'] = self.other_comment
        self.testapp.post_json(
            self.URL_POST_COMMENT % self.user_post.key.urlsafe(),
            self.body
        )

        # Update post
        self.user_post = self.user_post.key.get()

        # Verify size of list
        self.assertEquals(len(self.user_post.comments), 1,
                          "Expected size of comment's list should be one")

    @patch('utils.verify_token', return_value={'email': other_user_email})
    def test_delete(self, verify_token):
        """User can delete your comment in Post."""
        # Added comment
        self.response = self.testapp.post_json(
            self.URL_POST_COMMENT % self.user_post.key.urlsafe(),
            self.body
        ).json
        # ID of comment
        self.id_comment = self.response["id"]
        self.user_post = self.user_post.key.get()
        self.assertEquals(len(self.user_post.comments), 1,
                          "Expected size of comment's list should be one")

        # Call the delete method
        self.testapp.delete(self.URL_DELETE_COMMENT %
                            (self.user_post.key.urlsafe(), self.id_comment))

        # Update post
        self.user_post = self.user_post.key.get()

        # Verify size of list
        self.assertEquals(len(self.user_post.comments), 0,
                          "Expected size of comment's list should be zero")

    @patch('utils.verify_token', return_value={'email': other_user_email})
    def test_delete_in_deleted_post(self, verify_token):
        """User can not delete comment in deleted Post."""
        # Added comment
        self.response = self.testapp.post_json(
            self.URL_POST_COMMENT % self.user_post.key.urlsafe(),
            self.body
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
            self.testapp.delete(self.URL_DELETE_COMMENT %
                                (self.user_post.key.urlsafe(), self.id_comment))

        raises_context_message = self.get_message_exception(raises_context.exception.message)
        self.assertEquals(
            raises_context_message,
            exception_message,
            "Expected: " + exception_message + ". But got: " + raises_context_message)
        self.assertEquals(len(self.user_post.comments), 1,
                          "Expected size of comment's list should be one")

    @patch('utils.verify_token', return_value={'email': user_email})
    def test_delete_simpleuser(self, verify_token):
        """An simple user can't delete comments by other users in Post."""
        # Added comment of user
        self.response = self.testapp.post_json(
            self.URL_POST_COMMENT % self.user_post.key.urlsafe(),
            self.body
        ).json
        # ID of comment
        self.id_comment = self.response["id"]
        self.user_post = self.user_post.key.get()
        self.assertEquals(len(self.user_post.comments), 1,
                          "Expected size of comment's list should be one")

        # Pretend an authentication
        verify_token.return_value={'email': other_user_email}

        # User other_user call the delete method
        exception_message = "Error! User not allowed to remove comment"
        with self.assertRaises(Exception) as raises_context:
            self.testapp.delete(self.URL_DELETE_COMMENT %
                                (self.user_post.key.urlsafe(), self.id_comment))

        raises_context_message = self.get_message_exception(raises_context.exception.message)
        self.assertEquals(
            raises_context_message,
            exception_message,
            "Expected: " + exception_message + ". But got: " + raises_context_message)
        self.assertEquals(len(self.user_post.comments), 1,
                          "Expected size of comment's list should be one")

    @patch('utils.verify_token', return_value={'email': other_user_email})
    def test_delete_ownerpost(self, verify_token):
        """Owner user can delete comment from other user in Post."""
        # Added comment user other_user
        self.body['commentData'] = self.other_comment
        self.response = self.testapp.post_json(
            self.URL_POST_COMMENT % self.user_post.key.urlsafe(),
            self.body
        ).json
        # ID of comment
        self.id_other_comment = self.response["id"]
        self.user_post = self.user_post.key.get()
        self.assertEquals(len(self.user_post.comments), 1,
                          "Expected size of comment's list should be one")

        # Call the delete method
        self.testapp.delete(self.URL_DELETE_COMMENT %
                            (self.user_post.key.urlsafe(), self.id_other_comment))

        # Update post
        self.user_post = self.user_post.key.get()

        # Verify size of list
        self.assertEquals(len(self.user_post.comments), 0,
                          "Expected size of comment's list should be zero")

    @patch('utils.verify_token', return_value={'email': user_email})
    def test_check_permission(self, verify_token):
        """Test method check_permission in post_comment_handler."""
        # Added comment
        self.response = self.testapp.post_json(
            self.URL_POST_COMMENT % self.user_post.key.urlsafe(),
            self.body
        ).json

        # When other_user try delete comment from user.
        with self.assertRaises(NotAuthorizedException):
            check_permission(self.other_user, self.institution, self.user_post, self.body)
