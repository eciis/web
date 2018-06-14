# -*- coding: utf-8 -*-
"""Post handler test."""

from ..test_base_handler import TestBaseHandler
from handlers.post_handler import PostHandler
from .. import mocks
from mock import patch
import json


class PostHandlerTest(TestBaseHandler):
    """Test the post_handler class."""

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(PostHandlerTest, cls).setUp()
        methods = set(cls.webapp2.WSGIApplication.allowed_methods)
        methods.add('PATCH')
        cls.webapp2.WSGIApplication.allowed_methods = frozenset(methods)
        app = cls.webapp2.WSGIApplication(
            [("/api/posts/(.*)", PostHandler),
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)

        # first user
        cls.first_user = mocks.create_user('first_user@gmail.com')
        # second user
        cls.second_user = mocks.create_user('second_user@ccc.ufcg.edu.br')
        # institution
        cls.institution = mocks.create_institution('institution')
        cls.institution.state = 'active'
        cls.institution.add_member(cls.first_user)
        cls.institution.add_member(cls.second_user)
        cls.institution.follow(cls.first_user.key)
        cls.institution.follow(cls.second_user.key)
        cls.institution.set_admin(cls.first_user.key)
        cls.first_user.add_institution(cls.institution.key)
        cls.first_user.add_institution_admin(cls.institution.key)
        # POST of first_user To Institution
        cls.first_user_post = mocks.create_post(cls.first_user.key, cls.institution.key)
        # POST of first_user To institution
        cls.first_user_other_post = mocks.create_post(cls.first_user.key, cls.institution.key)
        # Post of second_user
        cls.second_user_post = mocks.create_post(cls.second_user.key, cls.institution.key)
        # update institution's posts
        cls.institution.posts = [cls.second_user_post.key, cls.first_user_post.key,
                                cls.first_user_other_post.key]
        cls.institution.put()
        # comment
        cls.second_user_comment = mocks.create_comment(cls.institution.key.urlsafe(), cls.second_user)

    @patch('util.login_service.verify_token', return_value={'email': 'first_user@gmail.com'})
    def test_get(self, verify_token):
        """Test the post_handler's get method."""
        # Call the get method
        response = self.testapp.get("/api/posts/%s" % self.second_user_post.key.urlsafe())
        host = response.request.host
        result = json.loads(response.body)

        post_json = self.second_user_post.make(host)

        for attr in post_json:
            if attr is not None:
                self.assertEqual(result[attr], post_json[attr],
                'should be equal')

    @patch('util.login_service.verify_token', return_value={'email': 'first_user@gmail.com'})
    def test_delete(self, verify_token):
        """Test the post_handler's delete method."""
        # test delete post when the post has a comment
        # Verify if before the delete the post's state is published
        self.assertEqual(self.first_user_post.state, 'published',
                         "The post's state must be published")
        self.first_user_post.add_comment(self.second_user_comment)
        self.testapp.delete("/api/posts/%s" % self.first_user_post.key.urlsafe())
        # Retrieve the post from the datastore, once it has been changed
        self.first_user_post = self.first_user_post.key.get()
        # Make sure the post's state is deleted
        self.assertEqual(self.first_user_post.state, 'deleted',
                         "The post's state must be deleted")

        # test delete post when the post has a like
        # Verify if before the delete the post's state is published
        self.assertEqual(self.first_user_other_post.state, 'published',
                         "The post's state must be published")
        self.first_user_other_post.like(self.second_user.key)
        self.testapp.delete("/api/posts/%s"
                            % self.first_user_other_post.key.urlsafe())
        # Retrieve the post from the datastore, once it has been changed
        self.first_user_other_post = self.first_user_other_post.key.get()
        # Make sure the post's state is deleted
        self.assertEqual(self.first_user_other_post.state, 'deleted',
                         "The post's state must be deleted")

        # Pretend an authentication
        verify_token.return_value = {'email': 'second_user@ccc.ufcg.edu.br'}

        # test delete post when the post has no activity
        # Verify if before the delete the post's state is published
        self.assertEqual(self.second_user_post.state, 'published',
                         "The post's state must be published")
        # Verify if institution has only one post
        self.assertEqual(len(self.institution.posts), 3,
                         "institution should have only one post")
        # Call the delete method
        self.testapp.delete("/api/posts/%s" % self.second_user_post.key.urlsafe())
        # update institution
        self.institution = self.institution.key.get()
        # Make sure the post was deleted from institution
        self.assertEqual(len(self.institution.posts), 3,
                         "institution should have the same number of posts")
        # Update post
        self.second_user_post = self.second_user_post.key.get()
        self.assertEqual(self.second_user_post.state, 'deleted',
                         "After delete the post state should be 'deleted'")

    @patch('util.login_service.verify_token', return_value={'email': 'first_user@gmail.com'})
    def test_patch_unauthorized(self, verify_token):
        """ Test the post_handle's patch method in case that user is not authorized."""
        exception_message = "Error! User is not allowed to edit this post"
        expected_alert = "Expected: " + exception_message + ". But got: "

        # Call the patch method and assert that  it raises an exception
        with self.assertRaises(Exception) as raises_context:
            self.testapp.patch_json("/api/posts/%s"
                                    % self.second_user_post.key.urlsafe(),
                                    [{"op": "replace", "path": "/text",
                                      "value": "testando"}]
                                    )

        raises_context_message = self.get_message_exception(str(raises_context.exception))
        self.assertEqual(
            raises_context_message,
            exception_message,
            expected_alert + raises_context_message)
        
        # Pretend a new authentication
        verify_token.return_value = {'email': 'second_user@ccc.ufcg.edu.br'}

        # Call the patch method and assert that it works
        self.testapp.patch_json("/api/posts/%s"
                                % self.second_user_post.key.urlsafe(),
                                [{"op": "replace", "path": "/text",
                                    "value": "testando"}]
                                )
        self.second_user_post = self.second_user_post.key.get()
        self.assertEqual(self.second_user_post.text, "testando")
        # Call the patch method and assert that  it raises an exception
        with self.assertRaises(Exception) as raises_context:
            self.testapp.patch_json("/api/posts/%s"
                                    % self.first_user_post.key.urlsafe(),
                                    [{"op": "replace", "path": "/text",
                                      "value": "testando"}]
                                    )

        raises_context_message = self.get_message_exception(str(raises_context.exception))
        self.assertEqual(
            raises_context_message,
            exception_message,
            expected_alert + raises_context_message)

    @patch('util.login_service.verify_token', return_value={'email': 'first_user@gmail.com'})
    def test_patch(self, verify_token):
        """Test the post_handler's patch method when user can't edit the post."""
        exception_message = "Error! This post cannot be updated"
        expected_alert = "Expected: " + exception_message + ". But got: "
        # Call the patch method and assert that it works
        self.testapp.patch_json("/api/posts/%s"
                                % self.first_user_post.key.urlsafe(),
                                [{"op": "replace", "path": "/text",
                                    "value": "testando"}]
                                )
        self.first_user_post = self.first_user_post.key.get()
        self.assertEqual(self.first_user_post.text, "testando")
        
        # test the case when the post has a like, so it can not be updated
        self.first_user_post.like(self.second_user.key)
        self.first_user_post = self.first_user_post.key.get()

        with self.assertRaises(Exception) as raises_context:
            self.testapp.patch_json("/api/posts/%s"
                                    % self.first_user_post.key.urlsafe(),
                                    [{"op": "replace", "path": "/text",
                                        "value": "testando"}]
                                    )

        raises_context_message = self.get_message_exception(str(raises_context.exception))
        self.assertEqual(
            raises_context_message,
            exception_message,
            expected_alert + raises_context_message)

        # test the case when the post has a comment, so it can not be updated
        self.first_user_post.add_comment(self.second_user_comment)
        self.first_user_post = self.first_user_post.key.get()

        with self.assertRaises(Exception) as raises_context:
            self.testapp.patch_json("/api/posts/%s"
                                    % self.first_user_post.key.urlsafe(),
                                    [{"op": "replace", "path": "/text",
                                        "value": "testando"}]
                                    )

        #test case when institution of the post is inactive
        #this post doesn't have any activity
        self.institution.state = "inactive"
        self.institution.put()
        self.assertFalse(self.first_user_other_post.has_activity())
        
        with self.assertRaises(Exception) as raises_context:
            self.testapp.patch_json("/api/posts/%s"
                                    % self.first_user_other_post.key.urlsafe(),
                                    [{"op": "replace", "path": "/text",
                                        "value": "testando"}]
                                    )

        raises_context_message = self.get_message_exception(str(raises_context.exception))
        self.assertEqual(
            raises_context_message,
            exception_message,
            expected_alert + raises_context_message)

        #test case when the post was deleted
        #this post doesn't have any activity
        self.institution.state = "active"
        self.institution.put()
        self.first_user_other_post.state = "deleted"
        self.first_user_other_post.put()
        self.assertFalse(self.first_user_other_post.has_activity())

        with self.assertRaises(Exception) as raises_context:
            self.testapp.patch_json("/api/posts/%s"
                                    % self.first_user_other_post.key.urlsafe(),
                                    [{"op": "replace", "path": "/text",
                                        "value": "testando"}]
                                    )

        raises_context_message = self.get_message_exception(str(raises_context.exception))
        self.assertEqual(
            raises_context_message,
            exception_message,
            expected_alert + raises_context_message)
    
    @patch('handlers.post_handler.send_message_notification')
    @patch('util.login_service.verify_token', return_value={'email': 'first_user@gmail.com'})
    def test_delete_with_admin(self, verify_token, mock_method):
        """Test delete a post with admin."""
        self.first_user.add_permission(
            "remove_posts", self.institution.key.urlsafe())
        self.first_user.put()
        self.assertEqual(self.second_user_post.state, 'published',
                          "The post's state must be published")
        self.testapp.delete("/api/posts/%s" %
                            self.second_user_post.key.urlsafe())
        # Retrieve the post from the datastore, once it has been changed
        self.second_user_post = self.second_user_post.key.get()
        # Make sure the post's state is deleted
        self.assertEqual(self.second_user_post.state, 'deleted',
                         "The post's state must be deleted")
        
        mock_method.assert_called()

    @patch('util.login_service.verify_token', return_value={'email': 'second_user@ccc.ufcg.edu.br'})
    def test_delete_without_admin(self, verify_token):
        """Test delete a post with admin."""
        self.assertEqual(self.first_user_post.state, 'published',
                         "The post's state must be published")
        with self.assertRaises(Exception) as raises_context:
            self.testapp.delete("/api/posts/%s" %
                                self.first_user_post.key.urlsafe())
        # Retrieve the post from the datastore, once it has been changed
        self.first_user_post = self.first_user_post.key.get()
        # Make sure the post's state is deleted
        self.assertEqual(self.first_user_post.state, 'published',
                         "The post's state must be published")
        message = self.get_message_exception(str(raises_context.exception))
        self.assertEquals(message, "Error! The user can not remove this post")

    def tearDown(cls):
        """Deactivate the test."""
        cls.test.deactivate()
