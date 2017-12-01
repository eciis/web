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
        first_user = mocks.create_user()
        second_user = mocks.create_user()
        inst = mocks.create_institution()
        first_user_post = mocks.create_post(
            first_user.key, inst.key)
        with self.assertRaises(NotAuthorizedException) as Aex:
            is_authorized_to_delete_post(self, second_user,
                                         first_user_post.key.urlsafe())
        # Make sure that the message of the exception is the expected one
        self.assertEqual(str(Aex.exception),
                         'User is not allowed to remove this post',
                         "A different message than expected was received")

    def test_everything_ok(self):
        """Test if everything goes ok."""
        """ Make sure if the return is None, once when everything goes ok
        the method returns nothing."""
        user_admin = mocks.create_user()
        common_user = mocks.create_user()
        inst = mocks.create_institution()
        inst.admin = user_admin.key
        inst.put()
        admin_post = mocks.create_post(
            user_admin.key, inst.key)
        common_user_post = mocks.create_post(
            common_user.key, inst.key)
        self.assertIsNone(is_authorized_to_delete_post(self, user_admin,
                                                       admin_post.key.urlsafe()),
                          "Something went wrong during the execution")
        """ Make sure if the return is None, once when everything goes ok
        the method returns nothing."""
        self.assertIsNone(is_authorized_to_delete_post(self, user_admin,
                                                       common_user_post.key.urlsafe()),
                          "Something went wrong during the execution")

    def test_is_post_author_in_failure(self):
        """Test is_post_author decorator."""
        """Make sure that an exception is raised because the user
        is not the post's author."""
        first_user = mocks.create_user()
        second_user = mocks.create_user()
        inst = mocks.create_institution()
        first_user_post = mocks.create_post(
            first_user.key, inst.key)
        with self.assertRaises(NotAuthorizedException) as Naex:
            is_decorated_by_post_author(
                self, second_user, first_user_post.key.urlsafe())
        self.assertEquals(
            Naex.exception.message, 'User is not allowed to edit this post',
            "The exception's message wasn't the expected one")
        # Test with an invalid url_string.
        with self.assertRaises(Exception):
            is_decorated_by_post_author(
                self, second_user, "")

    def test_is_post_author_in_success(self):
        """Test is_post_author decorator."""
        """ Make sure if the return is None, once when everything goes ok
        the method returns nothing."""
        first_user = mocks.create_user()
        inst = mocks.create_institution()
        first_user_post = mocks.create_post(
            first_user.key, inst.key)
        self.assertIsNone(is_decorated_by_post_author(self, first_user,
                                                      first_user_post.key.urlsafe()),
                          "Something went wrong during the execution")

    def tearDown(self):
        """End up the test."""
        self.test.deactivate()


@is_authorized
def is_authorized_to_delete_post(self, user, key):
    """Allow the system test the decorator."""
    pass


@is_post_author
def is_decorated_by_post_author(self, user, url_string):
    """Allow the system test the decorator."""
    pass
