# -*- coding: utf-8 -*-
"""Decorator test."""


from test_base import TestBase
from models.post import Post
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

        initModels(cls)

    def test_not_allowed(self):
        """Test if the user is really not allowed."""
        """Make sure that an exception is raised because the user
        is not authorized."""
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


def initModels(cls):
    """Init the models."""
    # new First User
    cls.first_user = mocks.create_user()
    # new Second User
    cls.second_user = mocks.create_user()
    # new Third User
    cls.third_user = mocks.create_user()
    # new First Institution
    cls.first_inst = mocks.create_institution()
    cls.first_inst.cnpj = '18.104.068/0001-86'
    cls.first_inst.legal_nature = 'public'
    cls.first_inst.actuation_area = ''
    cls.first_inst.description = 'Ensaio Químico - Determinação de Material Volátil por \
            Gravimetria e Ensaio Biológico - Ensaio de Citotoxicidade'
    cls.first_inst.phone_number = '(83) 3322 4455'
    cls.first_inst.members = [cls.first_user.key, cls.second_user.key]
    cls.first_inst.followers = [cls.first_user.key, cls.second_user.key]
    cls.first_inst.admin = cls.first_user.key
    cls.first_inst.put()
    # POST of First User To First Institution
    cls.first_user_post = Post()
    cls.first_user_post.title = "Novo edital do CERTBIO"
    cls.first_user_post.text = "At vero eos et accusamus et iusto odio dignissimos \
        ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti \
        quos dolores et quas molestias excepturi sint occaecati cupiditate \
        aut perferendis doloribus asperiores repellat."
    cls.first_user_post.author = cls.first_user.key
    cls.first_user_post.institution = cls.first_inst.key
    cls.first_user_post.put()
    # new Second Institution
    cls.second_inst = mocks.create_institution()
    cls.second_inst.cnpj = '18.104.068/0001-56'
    cls.second_inst.legal_nature = 'public'
    cls.second_inst.actuation_area = ''
    cls.second_inst.description = 'The mission of the Software Practices Laboratory (SPLab) \
            is to promote the development of the state-of-the-art in the \
            theory and practice of Software Engineering.'
    cls.second_inst.photo_url = 'http://amaurymedeiros.com/images/second_inst.png'
    cls.second_inst.phone_number = '(83) 3322 7865'
    cls.second_inst.members = [cls.first_user.key, cls.third_user.key]
    cls.second_inst.followers = [cls.first_user.key, cls.third_user.key]
    cls.second_inst.admin = cls.first_user.key
    cls.second_inst.put()
    # Second User's post
    cls.second_user_post = Post()
    cls.second_user_post.title = "Novwdfssdo edital do CERTBIO"
    cls.second_user_post.text = "At vero eos et accusamus et iusto odio dignissimos \
        ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti \
        delectus, ut aut reiciendis voluptatibus maiores alias consequatur \
        aut perferendis doloribus asperiores repellat."
    cls.second_user_post.author = cls.second_user.key
    cls.second_user_post.institution = cls.second_inst.key
    cls.second_user_post.put()
    # Another second user's post
    cls.second_user_post2 = Post()
    cls.second_user_post2.title = "Novwdfsadsssdo edital do CERTBIO"
    cls.second_user_post2.text = "At vero eos et accusamus et iusto odio dignissimos \
        ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti \
        delectus, ut aut reiciendis voluptatibus maiores alias consequatur \
        aut perferendis doloribus asperiores repellat."
    cls.second_user_post2.author = cls.second_user.key
    cls.second_user_post2.institution = cls.first_inst.key
    cls.second_user_post2.put()
    # third user's post
    cls.third_user_post = Post()
    cls.third_user_post.title = "Novwdfssdo edital do CERTBIO"
    cls.third_user_post.text = "At vero eos et accusamus et iusto odio dignissimos \
        emporibus autem quibusdam et aut officiis debitis aut rerum \
        necessitatibus saepe eveniet ut et voluptates repudiandae sint \
        et molestiae non recusandae. Itaque earum rerum hic tenetur sapiente \
        delectus, ut aut reiciendis voluptatibus maiores alias consequatur \
        aut perferendis doloribus asperiores repellat."
    cls.third_user_post.author = cls.third_user.key
    cls.third_user_post.institution = cls.first_inst.key
    cls.third_user_post.put()
