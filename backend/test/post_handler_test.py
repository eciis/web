# -*- coding: utf-8 -*-
"""Post handler test."""

from test_base_handler import TestBaseHandler
from models.post import Post
from models.user import User
from models.institution import Institution
from models.post import Comment
from handlers.post_handler import PostHandler

from mock import patch


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
        initModels(cls)

    @patch('utils.verify_token', return_value={'email': 'first_user@gmail.com'})
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

    @patch('utils.verify_token', return_value={'email': 'first_user@gmail.com'})
    def test_patch(self, verify_token):
        """Test the post_handler's patch method."""

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

        # Call the patch method and assert that it works
        self.testapp.patch_json("/api/posts/%s"
                                % self.first_user_post.key.urlsafe(),
                                [{"op": "replace", "path": "/text",
                                    "value": "testando"}]
                                )
        self.first_user_post = self.first_user_post.key.get()
        self.assertEqual(self.first_user_post.text, "testando")
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

        raises_context_message = self.get_message_exception(str(raises_context.exception))
        self.assertEqual(
            raises_context_message,
            exception_message,
            expected_alert + raises_context_message)

    def tearDown(cls):
        """Deactivate the test."""
        cls.test.deactivate()


def initModels(cls):
    """Init the models."""
    # new User first_user
    cls.first_user = User()
    cls.first_user.name = 'first_user'
    cls.first_user.email = ['first_user@gmail.com']
    cls.first_user.put()

    # new User second_user
    cls.second_user = User()
    cls.second_user.name = 'second_user'
    cls.second_user.email = ['second_user@ccc.ufcg.edu.br']
    cls.second_user.photo_url = '/img.jpg'
    cls.second_user.put()

    # new Institution
    cls.institution = Institution()
    cls.institution.name = 'institution'
    cls.institution.members = [cls.first_user.key, cls.second_user.key]
    cls.institution.followers = [cls.first_user.key, cls.second_user.key]
    cls.institution.admin = cls.first_user.key
    cls.institution.put()

    # POST of first_user To Institution
    cls.first_user_post = Post()
    cls.first_user_post.author = cls.first_user.key
    cls.first_user_post.institution = cls.institution.key
    cls.first_user_post.put()

    # POST of first_user To institution
    cls.first_user_other_post = Post()
    cls.first_user_other_post.author = cls.first_user.key
    cls.first_user_other_post.institution = cls.institution.key
    cls.first_user_other_post.put()

    # Post of second_user
    cls.second_user_post = Post()
    cls.second_user_post.author = cls.second_user.key
    cls.second_user_post.institution = cls.institution.key
    cls.second_user_post.put()

    # update institution's posts
    cls.institution.posts = [cls.second_user_post.key, cls.first_user_post.key,
                             cls.first_user_other_post.key]
    cls.institution.put()

    # comment
    data_comment = {"text": "hello",
                    "institution_key": cls.institution.key.urlsafe()}
    cls.second_user_comment = Comment.create(data_comment, cls.second_user)
    cls.second_user_comment.put()
