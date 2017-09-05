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

    @patch('utils.verify_token', return_value={'email': 'user@example.com'})
    def test_delete(self, verify_token):
        """Test the post_handler's delete method."""
        # Verify if before the delete the post's state is published
        self.assertEqual(self.user_post.state, 'published',
                         "The post's state must be published")
        # Call the delete method
        self.testapp.delete("/api/posts/%s" % self.user_post.key.urlsafe())
        # Retrieve the post from the datastore, once it has been changed
        self.user_post = self.user_post.key.get()
        # Make sure the post's state is deleted
        self.assertEqual(self.user_post.state, 'deleted',
                         "The post's state must be deleted")

        # Pretend an authentication
        verify_token.return_value = {'email': 'testuser@example.com'}

        # Verify if before the delete the post's state is published
        self.assertEqual(self.test_user_post.state, 'published',
                         "The post's state must be published")
        # Call the delete method
        self.testapp.delete("/api/posts/%s" % self.test_user_post.key.urlsafe())
        # Retrieve the post from the datastore, once it has been changed
        self.test_user_post = self.test_user_post.key.get()
        # Make sure the post's state is deleted
        self.assertEqual(self.test_user_post.state, 'deleted',
                         "The post's state must be deleted")

    @patch('utils.verify_token', return_value={'email': 'user@example.com'})
    def test_patch(self, verify_token):
        """Test the post_handler's patch method."""
        # Call the patch method and assert that  it raises an exception
        with self.assertRaises(Exception):
            self.testapp.patch_json("/api/posts/%s"
                                    % self.test_user_post.key.urlsafe(),
                                    [{"op": "replace", "path": "/text",
                                      "value": "testando"}]
                                    )
        # Call the patch method and assert that it works
        self.testapp.patch_json("/api/posts/%s"
                                % self.user_post.key.urlsafe(),
                                [{"op": "replace", "path": "/text",
                                    "value": "testando"}]
                                )
        self.user_post = self.user_post.key.get()
        self.assertEqual(self.user_post.text, "testando")
        # Pretend a new authentication
        verify_token.return_value = {'email': 'testuser@example.com'}

        # Call the patch method and assert that it works
        self.testapp.patch_json("/api/posts/%s"
                                % self.test_user_post.key.urlsafe(),
                                [{"op": "replace", "path": "/text",
                                    "value": "testando"}]
                                )
        self.test_user_post = self.test_user_post.key.get()
        self.assertEqual(self.test_user_post.text, "testando")
        # Call the patch method and assert that  it raises an exception
        with self.assertRaises(Exception):
            self.testapp.patch_json("/api/posts/%s"
                                    % self.user_post.key.urlsafe(),
                                    [{"op": "replace", "path": "/text",
                                      "value": "testando"}]
                                    )
        # test the case when the post has a like, so it can not be updated
        self.user_post.like(self.test_user.key)
        self.user_post = self.user_post.key.get()
        with self.assertRaises(Exception):
            self.testapp.patch_json("/api/posts/%s"
                                    % self.user_post.key.urlsafe(),
                                    [{"op": "replace", "path": "/text",
                                        "value": "testando"}]
                                    )

        # test the case when the post has a comment, so it can not be updated
        self.user_post.add_comment(self.test_user_comment)
        self.user_post = self.user_post.key.get()
        with self.assertRaises(Exception):
            self.testapp.patch_json("/api/posts/%s"
                                    % self.user_post.key.urlsafe(),
                                    [{"op": "replace", "path": "/text",
                                        "value": "testando"}]
                                    )

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
    # new User Test User
    cls.test_user = User()
    cls.test_user.name = 'Test User'
    cls.test_user.email = 'testuser@example.com'
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
    # Post of Test User
    cls.test_user_post = Post()
    cls.test_user_post.author = cls.test_user.key
    cls.test_user_post.institution = cls.institution.key
    cls.test_user_post.put()
    # comment
    data_comment = {"text": "comment",
                    "institution_key": cls.institution.key.urlsafe()}
    cls.test_user_comment = Comment.create(data_comment, cls.test_user)
    cls.test_user_comment.put()
