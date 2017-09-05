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

    @patch('utils.verify_token', return_value={'email': 'firstUser@gmail.com'})
    def test_delete(self, verify_token):
        """Test the post_handler's delete method."""
        # test delete post when the post has a comment
        # Verify if before the delete the post's state is published
        self.assertEqual(self.firstUser_post.state, 'published',
                         "The post's state must be published")
        self.firstUser_post.add_comment(self.secondUser_comment)
        self.testapp.delete("/api/posts/%s" % self.firstUser_post.key.urlsafe())
        # Retrieve the post from the datastore, once it has been changed
        self.firstUser_post = self.firstUser_post.key.get()
        # Make sure the post's state is deleted
        self.assertEqual(self.firstUser_post.state, 'deleted',
                         "The post's state must be deleted")

        # test delete post when the post has a like
        # Verify if before the delete the post's state is published
        self.assertEqual(self.firstUser_other_post.state, 'published',
                         "The post's state must be published")
        self.firstUser_other_post.like(self.secondUser.key)
        self.testapp.delete("/api/posts/%s"
                            % self.firstUser_other_post.key.urlsafe())
        # Retrieve the post from the datastore, once it has been changed
        self.firstUser_other_post = self.firstUser_other_post.key.get()
        # Make sure the post's state is deleted
        self.assertEqual(self.firstUser_other_post.state, 'deleted',
                         "The post's state must be deleted")

        # Pretend an authentication
        verify_token.return_value = {'email': 'secondUser@ccc.ufcg.edu.br'}

        # test delete post when the post has no activity
        # Verify if before the delete the post's state is published
        self.assertEqual(self.secondUser_post.state, 'published',
                         "The post's state must be published")
        # Verify if institution has only one post
        self.assertEqual(len(self.institution.posts), 3,
                         "institution should have only one post")
        # Call the delete method
        self.testapp.delete("/api/posts/%s" % self.secondUser_post.key.urlsafe())
        # update institution
        self.institution = self.institution.key.get()
        # Make sure the post was deleted from institution
        self.assertEqual(len(self.institution.posts), 3,
                         "institution should have the same number of posts")
        # Update post
        self.secondUser_post = self.secondUser_post.key.get()
        self.assertEqual(self.secondUser_post.state, 'deleted',
                         "After delete the post state should be 'deleted'")

    @patch('utils.verify_token', return_value={'email': 'firstUser@gmail.com'})
    def test_patch(self, verify_token):
        """Test the post_handler's patch method."""
        # Call the patch method and assert that  it raises an exception
        with self.assertRaises(Exception):
            self.testapp.patch_json("/api/posts/%s"
                                    % self.secondUser_post.key.urlsafe(),
                                    [{"op": "replace", "path": "/text",
                                      "value": "testando"}]
                                    )
        # Call the patch method and assert that it works
        self.testapp.patch_json("/api/posts/%s"
                                % self.firstUser_post.key.urlsafe(),
                                [{"op": "replace", "path": "/text",
                                    "value": "testando"}]
                                )
        self.firstUser_post = self.firstUser_post.key.get()
        self.assertEqual(self.firstUser_post.text, "testando")
        # Pretend a new authentication
        verify_token.return_value = {'email': 'secondUser@ccc.ufcg.edu.br'}

        # Call the patch method and assert that it works
        self.testapp.patch_json("/api/posts/%s"
                                % self.secondUser_post.key.urlsafe(),
                                [{"op": "replace", "path": "/text",
                                    "value": "testando"}]
                                )
        self.secondUser_post = self.secondUser_post.key.get()
        self.assertEqual(self.secondUser_post.text, "testando")
        # Call the patch method and assert that  it raises an exception
        with self.assertRaises(Exception):
            self.testapp.patch_json("/api/posts/%s"
                                    % self.firstUser_post.key.urlsafe(),
                                    [{"op": "replace", "path": "/text",
                                      "value": "testando"}]
                                    )
        # test the case when the post has a like, so it can not be updated
        self.firstUser_post.like(self.secondUser.key)
        self.firstUser_post = self.firstUser_post.key.get()
        with self.assertRaises(Exception):
            self.testapp.patch_json("/api/posts/%s"
                                    % self.firstUser_post.key.urlsafe(),
                                    [{"op": "replace", "path": "/text",
                                        "value": "testando"}]
                                    )

        # test the case when the post has a comment, so it can not be updated
        self.firstUser_post.add_comment(self.secondUser_comment)
        self.firstUser_post = self.firstUser_post.key.get()
        with self.assertRaises(Exception):
            self.testapp.patch_json("/api/posts/%s"
                                    % self.firstUser_post.key.urlsafe(),
                                    [{"op": "replace", "path": "/text",
                                        "value": "testando"}]
                                    )

    def tearDown(cls):
        """Deactivate the test."""
        cls.test.deactivate()


def initModels(cls):
    """Init the models."""
    # new User firstUser
    cls.firstUser = User()
    cls.firstUser.name = 'firstUser'
    cls.firstUser.email = 'firstUser@gmail.com'
    cls.firstUser.put()

    # new User secondUser
    cls.secondUser = User()
    cls.secondUser.name = 'secondUser'
    cls.secondUser.email = 'secondUser@ccc.ufcg.edu.br'
    cls.secondUser.put()

    # new Institution
    cls.institution = Institution()
    cls.institution.name = 'institution'
    cls.institution.members = [cls.firstUser.key, cls.secondUser.key]
    cls.institution.followers = [cls.firstUser.key, cls.secondUser.key]
    cls.institution.admin = cls.firstUser.key
    cls.institution.put()

    # POST of firstUser To Institution
    cls.firstUser_post = Post()
    cls.firstUser_post.author = cls.firstUser.key
    cls.firstUser_post.institution = cls.institution.key
    cls.firstUser_post.put()

    # POST of firstUser To institution
    cls.firstUser_other_post = Post()
    cls.firstUser_other_post.author = cls.firstUser.key
    cls.firstUser_other_post.institution = cls.institution.key
    cls.firstUser_other_post.put()

    # Post of secondUser
    cls.secondUser_post = Post()
    cls.secondUser_post.author = cls.secondUser.key
    cls.secondUser_post.institution = cls.institution.key
    cls.secondUser_post.put()

    # update institution's posts
    cls.institution.posts = [cls.secondUser_post.key, cls.firstUser_post.key,
                             cls.firstUser_other_post.key]
    cls.institution.put()

    # comment
    data_comment = {"text": "hello",
                    "institution_key": cls.institution.key.urlsafe()}
    cls.secondUser_comment = Comment.create(data_comment, cls.secondUser.key,
                                            cls.firstUser_post.key)
    cls.secondUser_comment.put()
