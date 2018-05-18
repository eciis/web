# -*- coding: utf-8 -*-
"""Subscribe post handler test."""

from test_base_handler import TestBaseHandler
from models import Post
from models import User
from models import Institution
from handlers.subscribe_post_handler import SubscribePostHandler
from mock import patch


class SubscribePostHandlerTest(TestBaseHandler):
    """Subscribe post handler test."""

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(SubscribePostHandlerTest, cls).setUp()
        app = cls.webapp2.WSGIApplication(
            [("/api/posts/(.*)/subscribers", SubscribePostHandler)
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)
        initModels(cls)

    @patch('util.login_service.verify_token', return_value={'email': 'test@example.com'})
    def test_post(self, verify_token):
        """Test the SubscribePostHandler's post method."""
        # Check the initial conditions
        self.assertTrue(self.post.subscribers == [self.second_user.key])

        # Call the post method
        self.testapp.post("/api/posts/%s/subscribers" %
                          self.post.key.urlsafe())

        # Retrieve entity
        self.post = self.post.key.get()

        # Check the final conditions
        self.assertTrue(self.user.key in self.post.subscribers)

    @patch('util.login_service.verify_token', return_value={'email': 'test@example.com'})
    def test_delete(self, verify_token):
        """Test the SubscribePostHandler's delete method."""
        # Check the initial conditions
        self.post.subscribers.append(self.user.key)
        self.post.put()
        self.assertTrue(self.post.subscribers == [
                        self.second_user.key, self.user.key])

        # Call the delete method
        self.testapp.delete("/api/posts/%s/subscribers" %
                            self.post.key.urlsafe())

        # Retrieve entity
        self.post = self.post.key.get()

        # Check the final conditions
        self.assertFalse(self.user.key in self.post.subscribers)

    @patch('util.login_service.verify_token', return_value={'email': 'second@example.com'})
    def test_delete_with_author(self, verify_token):
        """Test the SubscribePostHandler's delete method with the author."""
        # Check the initial conditions
        self.assertTrue(self.post.subscribers == [self.second_user.key])

        # Assert that when the delete is called with the author, an exception
        # is raised
        with self.assertRaises(Exception):
            # Call the delete method
            self.testapp.delete("/api/posts/%s/subscribers" %
                                self.post.key.urlsafe())

        # Retrieve entity
        self.post = self.post.key.get()

        # Check the final conditions
        self.assertTrue(self.second_user.key in self.post.subscribers)

    def tearDown(cls):
        """Deactivate the test."""
        cls.test.deactivate()


def initModels(cls):
    """Init the models."""
    # new Institution
    cls.institution = Institution()
    cls.institution.name = 'Test institution'
    cls.institution.put()
    # new User
    cls.user = User()
    cls.user.name = "Test user"
    cls.user.state = "active"
    cls.user.email = ['test@example.com']
    cls.user.put()
    # new second_user
    cls.second_user = User()
    cls.second_user.name = 'Second User Test'
    cls.second_user.state = "active"
    cls.second_user.email = ['second@example.com']
    cls.second_user.put()
    # new Post
    cls.post = Post()
    cls.post.subscribers = [cls.second_user.key]
    cls.post.author = cls.second_user.key
    cls.post.institution = cls.institution.key
    cls.post.state = 'published'
    cls.post.put()
