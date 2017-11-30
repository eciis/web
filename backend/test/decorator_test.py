# -*- coding: utf-8 -*-
"""Decorator test."""


from test_base import TestBase
from custom_exceptions.notAuthorizedException import NotAuthorizedException
from utils import is_authorized
from handlers.post_handler import is_post_author
import mocks


class TestIsAuthorized(TestBase):
    """Test class."""

    @classmethod
    def setUp(cls):
        """Create the objects."""
        # Initiate appengine services
        cls.test = cls.testbed.Testbed()
        cls.test.activate()
        cls.test.init_datastore_v3_stub()
        cls.test.init_memcache_stub()
        cls.ndb.get_context().set_cache_policy(False)
        cls.test.init_search_stub()

    def test_not_allowed(self):
        """Test if the user is really not allowed."""
        """Make sure that an exception is raised because the user
        is not authorized."""
        self.first_user = mocks.create_user()
        self.second_user = mocks.create_user()
        self.third_user = mocks.create_user()
        self.first_inst = mocks.create_institution()
        self.second_inst = mocks.create_institution()
        self.first_user_post = mocks.create_post(
            self.first_user.key, self.first_inst.key)
        self.second_user_post = mocks.create_post(
            self.second_user.key, self.second_inst.key)
        self.third_user_post = mocks.create_post(
            self.third_user.key, self.first_inst.key)
        with self.assertRaises(NotAuthorizedException) as Aex:
            is_decorated(self, self.second_user,
                         self.first_user_post.key.urlsafe())
        # Make sure that the message of the exception is the expected one
        self.assertEqual(str(Aex.exception),
                         'User is not allowed to remove this post',
                         "A different message than expected was received")
        """Make sure that an exception is raised because the user
        is not authorized."""
        with self.assertRaises(NotAuthorizedException) as Aex:
            is_decorated(self, self.third_user,
                         self.second_user_post.key.urlsafe())
        # Make sure that the message of the exception is the expected one
        self.assertEqual(str(Aex.exception),
                         'User is not allowed to remove this post',
                         "A different message than expected was received")
        """Make sure that an exception is raised because the user
        is not authorized."""
        with self.assertRaises(NotAuthorizedException) as Aex:
            is_decorated(self, self.second_user,
                         self.third_user_post.key.urlsafe())
        # Make sure that the message of the exception is the expected one
        self.assertEqual(str(Aex.exception),
                         'User is not allowed to remove this post',
                         "A different message than expected was received")

    def test_everything_ok(self):
        """Test if everything goes ok."""
        """ Make sure if the return is None, once when everything goes ok
        the method returns nothing."""
        self.first_user = mocks.create_user()
        self.second_user = mocks.create_user()
        self.third_user = mocks.create_user()
        self.first_inst = mocks.create_institution()
        self.first_inst.admin = self.first_user.key
        self.first_inst.put()
        self.second_inst = mocks.create_institution()
        self.second_inst.admin = self.first_user.key
        self.second_inst.put()
        self.first_user_post = mocks.create_post(
            self.first_user.key, self.first_inst.key)
        self.second_user_post = mocks.create_post(
            self.second_user.key, self.second_inst.key)
        self.third_user_post = mocks.create_post(
            self.third_user.key, self.first_inst.key)
        self.assertIsNone(is_decorated(self, self.first_user,
                                       self.first_user_post.key.urlsafe()),
                          "Something went wrong during the execution")
        """ Make sure if the return is None, once when everything goes ok
        the method returns nothing."""
        self.assertIsNone(is_decorated(self, self.first_user,
                                       self.second_user_post.key.urlsafe()),
                          "Something went wrong during the execution")
        """ Make sure if the return is None, once when everything goes ok
        the method returns nothing."""
        self.assertIsNone(is_decorated(self, self.first_user,
                                       self.third_user_post.key.urlsafe()),
                          "Something went wrong during the execution")

    def test_is_post_author_in_failure(self):
        """Test is_post_author decorator."""
        """Make sure that an exception is raised because the user
        is not the post's author."""
        self.second_user = mocks.create_user()
        self.third_user = mocks.create_user()
        self.first_inst = mocks.create_institution()
        self.second_inst = mocks.create_institution()
        self.second_user_post = mocks.create_post(
            self.second_user.key, self.second_inst.key)
        self.third_user_post = mocks.create_post(
            self.third_user.key, self.first_inst.key)
        with self.assertRaises(NotAuthorizedException) as Naex:
            is_decorated_by_post_author(
                self, self.second_user, self.third_user_post.key.urlsafe())
        self.assertEquals(
            Naex.exception.message, 'User is not allowed to edit this post',
            "The exception's message wasn't the expected one")
        # Test with an invalid url_string.
        with self.assertRaises(Exception):
            is_decorated_by_post_author(
                self, self.second_user, "")

    def test_is_post_author_in_success(self):
        """Test is_post_author decorator."""
        """ Make sure if the return is None, once when everything goes ok
        the method returns nothing."""
        self.first_user = mocks.create_user()
        self.first_inst = mocks.create_institution()
        self.first_user_post = mocks.create_post(
            self.first_user.key, self.first_inst.key)
        self.assertIsNone(is_decorated_by_post_author(self, self.first_user,
                                                      self.first_user_post.key.urlsafe()),
                          "Something went wrong during the execution")

    def tearDown(self):
        """End up the test."""
        self.test.deactivate()


@is_authorized
def is_decorated(self, user, key):
    """Allow the system test the decorator."""
    pass


@is_post_author
def is_decorated_by_post_author(self, user, url_string):
    """Allow the system test the decorator."""
    pass
