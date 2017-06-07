# -*- coding: utf-8 -*-
"""Decorator test."""


import unittest
import sys
sys.path.append("../")
sys.path.insert(1, 'google_appengine')
sys.path.insert(1, 'google_appengine/lib/webapp2-2.5.2')
sys.path.insert(1, 'google_appengine/lib/yaml/lib')

from models.post import Post
from utils import NotAuthorizedException
from models.user import User
from models.institution import Institution
from utils import is_authorized
from handlers.post_handler import PostHandler
from google.appengine.ext import testbed
from google.appengine.ext import ndb
import webapp2
import webtest
import os
from google.appengine.datastore import datastore_stub_util


class TestIsAuthorized(unittest.TestCase):
    """Test class."""

    @classmethod
    def setUp(cls):
        """Create the objects."""
        # Initiate appengine services
        cls.testbed = testbed.Testbed()
        cls.testbed.activate()
        cls.testbed.init_datastore_v3_stub()
        cls.testbed.init_memcache_stub()
        ndb.get_context().set_cache_policy(False)

        initModels(cls)

    def test_not_allowed(self):
        """Test if the user is really not allowed."""
        """Make sure that an exception is raised because the user
        is not authorized."""
        with self.assertRaises(NotAuthorizedException) as Aex:
            is_decorated(self, self.raoni, self.mayza_post.key.urlsafe())
        # Make sure that the message of the exception is the expected one
        self.assertEqual(str(Aex.exception),
                         'User is not allowed to remove this post')
        """Make sure that an exception is raised because the user
        is not authorized."""
        with self.assertRaises(NotAuthorizedException) as Aex:
            is_decorated(self, self.ruan, self.raoni_post.key.urlsafe())
        # Make sure that the message of the exception is the expected one
        self.assertEqual(str(Aex.exception),
                         'User is not allowed to remove this post')
        """Make sure that an exception is raised because the user
        is not authorized."""
        with self.assertRaises(NotAuthorizedException) as Aex:
            is_decorated(self, self.raoni, self.ruan_post.key.urlsafe())
        # Make sure that the message of the exception is the expected one
        self.assertEqual(str(Aex.exception),
                         'User is not allowed to remove this post')

    def test_not_member(self):
        """Test when the user isn't an institution's member."""
        """Make sure that an exception is raised because the user
        is not a member of the institution."""
        with self.assertRaises(NotAuthorizedException) as Aex:
            is_decorated(self, self.raoni, self.raoni_post.key.urlsafe())
        # Make sure that the message of the exception is the expected one
        self.assertEqual(str(Aex.exception),
                         'User is not a member of this institution')
        """Make sure that an exception is raised because the user
        is not a member of the institution."""
        with self.assertRaises(NotAuthorizedException) as Aex:
            is_decorated(self, self.ruan, self.ruan_post.key.urlsafe())
        # Make sure that the message of the exception is the expected one
        self.assertEqual(str(Aex.exception),
                         'User is not a member of this institution')

    def test_everything_ok(self):
        """Test if everything goes ok."""
        """ Make sure if the return is None, once when everything goes ok
        the method returns nothing."""
        self.assertIsNone(is_decorated(self, self.mayza,
                                       self.mayza_post.key.urlsafe()))
        """ Make sure if the return is None, once when everything goes ok
        the method returns nothing."""
        self.assertIsNone(is_decorated(self, self.mayza,
                                       self.raoni_post.key.urlsafe()))
        """ Make sure if the return is None, once when everything goes ok
        the method returns nothing."""
        self.assertIsNone(is_decorated(self, self.mayza,
                                       self.ruan_post.key.urlsafe()))

    def tearDown(self):
        """End up the testbed."""
        self.testbed.deactivate()


@is_authorized
def is_decorated(self, user, key):
    """Allow the system test the decorator."""
    pass


class PostHandlerTest(unittest.TestCase):
    """Test the post_handler class."""

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        cls.testbed = testbed.Testbed()
        cls.testbed.activate()
        cls.policy = datastore_stub_util.PseudoRandomHRConsistencyPolicy(
            probability=1)
        cls.testbed.init_datastore_v3_stub(consistency_policy=cls.policy)
        cls.testbed.init_memcache_stub()
        ndb.get_context().set_cache_policy(False)
        initModels(cls)
        app = webapp2.WSGIApplication(
            [("/api/post/(.*)", PostHandler)], debug=True)
        cls.testapp = webtest.TestApp(app)

    def test_delete(self):
        """Test the post_handler's delete method."""
        # Pretend an authentication
        os.environ['REMOTE_USER'] = 'mayzabeel@gmail.com'
        os.environ['USER_EMAIL'] = 'mayzabeel@gmail.com'
        # Verify if before the delete the post's state is published
        self.assertEqual(self.mayza_post.state, 'published')
        # Call the delete method
        self.testapp.delete("/api/post/%s" % self.mayza_post.key.urlsafe())
        # Retrieve the post from the datastore, once it has been changed
        self.mayza_post = self.mayza_post.key.get()
        # Make sure the post's state is deleted
        self.assertEqual(self.mayza_post.state, 'deleted')

        # Pretend an authentication
        os.environ['REMOTE_USER'] = 'raoni.smaneoto@ccc.ufcg.edu.br'
        os.environ['USER_EMAIL'] = 'raoni.smaneoto@ccc.ufcg.edu.br'
        # Verify if before the delete the post's state is published
        self.assertEqual(self.raoni_post2.state, 'published')
        # Call the delete method
        self.testapp.delete("/api/post/%s" % self.raoni_post2.key.urlsafe())
        # Retrieve the post from the datastore, once it has been changed
        self.raoni_post2 = self.raoni_post2.key.get()
        # Make sure the post's state is deleted
        self.assertEqual(self.raoni_post2.state, 'deleted')

    def test_post(self):
        """Test the post_handler's post method."""
        # Pretend an authentication
        os.environ['REMOTE_USER'] = 'raoni.smaneoto@ccc.ufcg.edu.br'
        os.environ['USER_EMAIL'] = 'raoni.smaneoto@ccc.ufcg.edu.br'
        # Verify if before the like the number of likes at post is 0
        self.assertEqual(self.mayza_post.likes, 0)
        # Call the delete method
        self.testapp.post("/api/post/%s/like" % self.mayza_post.key.urlsafe())
        # Verify if after the like the number of likes at post is 1
        self.assertEqual(self.mayza_post.likes, 1)

    def tearDown(cls):
        """Deactivate the testbed."""
        cls.testbed.deactivate()


def initModels(cls):
    """Init the models."""
    # new User Mayza
    cls.mayza = User()
    cls.mayza.name = 'Mayza Nunes'
    cls.mayza.cpf = '089.675.908-90'
    cls.mayza.email = 'mayzabeel@gmail.com'
    cls.mayza.institutions = []
    cls.mayza.follows = []
    cls.mayza.institutions_admin = []
    cls.mayza.notifications = []
    cls.mayza.posts = []
    cls.mayza.put()
    # new User Raoni
    cls.raoni = User()
    cls.raoni.name = 'Raoni Smaneoto'
    cls.raoni.cpf = '089.675.908-65'
    cls.raoni.email = 'raoni.smaneoto@ccc.ufcg.edu.br'
    cls.raoni.institutions = []
    cls.raoni.follows = []
    cls.raoni.institutions_admin = []
    cls.raoni.notifications = []
    cls.raoni.posts = []
    cls.raoni.put()
    # new User Ruan
    cls.ruan = User()
    cls.ruan.name = 'Ruan'
    cls.ruan.cpf = '089.675.908-65'
    cls.ruan.email = 'ruan@gmail.com'
    cls.ruan.institutions = []
    cls.ruan.follows = []
    cls.ruan.institutions_admin = []
    cls.ruan.notifications = []
    cls.ruan.posts = []
    cls.ruan.put()
    # new Institution CERTBIO
    cls.certbio = Institution()
    cls.certbio.name = 'CERTBIO'
    cls.certbio.cnpj = '18.104.068/0001-86'
    cls.certbio.legal_nature = 'public'
    cls.certbio.address = 'Universidade Federal de Campina Grande'
    cls.certbio.occupation_area = ''
    cls.certbio.description = 'Ensaio Químico - Determinação de Material Volátil por \
            Gravimetria e Ensaio Biológico - Ensaio de Citotoxicidade'
    cls.certbio.email = 'certbio@ufcg.edu.br'
    cls.certbio.phone_number = '(83) 3322 4455'
    cls.certbio.members = [cls.mayza.key, cls.raoni.key]
    cls.certbio.followers = [cls.mayza.key, cls.raoni.key]
    cls.certbio.posts = []
    cls.certbio.admin = cls.mayza.key
    cls.certbio.put()
    # POST of Mayza To Certbio Institution
    cls.mayza_post = Post()
    cls.mayza_post.title = "Novo edital do CERTBIO"
    cls.mayza_post.text = "At vero eos et accusamus et iusto odio dignissimos \
        ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti \
        quos dolores et quas molestias excepturi sint occaecati cupiditate \
        aut perferendis doloribus asperiores repellat."
    cls.mayza_post.author = cls.mayza.key
    cls.mayza_post.institution = cls.certbio.key
    cls.mayza_post.put()
    # new Institution SPLAB
    cls.splab = Institution()
    cls.splab.name = 'SPLAB'
    cls.splab.cnpj = '18.104.068/0001-56'
    cls.splab.legal_nature = 'public'
    cls.splab.address = 'Universidade Federal de Campina Grande'
    cls.splab.occupation_area = ''
    cls.splab.description = 'The mission of the Software Practices Laboratory (SPLab) \
            is to promote the development of the state-of-the-art in the \
            theory and practice of Software Engineering.'
    cls.splab.image_url = 'http://amaurymedeiros.com/images/splab.png'
    cls.splab.email = 'splab@ufcg.edu.br'
    cls.splab.phone_number = '(83) 3322 7865'
    cls.splab.members = [cls.mayza.key, cls.ruan.key]
    cls.splab.followers = [cls.mayza.key, cls.ruan.key]
    cls.splab.posts = []
    cls.splab.admin = cls.mayza.key
    cls.splab.put()
    # POST of Raoni
    cls.raoni_post = Post()
    cls.raoni_post.title = "Novwdfssdo edital do CERTBIO"
    cls.raoni_post.text = "At vero eos et accusamus et iusto odio dignissimos \
        ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti \
        delectus, ut aut reiciendis voluptatibus maiores alias consequatur \
        aut perferendis doloribus asperiores repellat."
    cls.raoni_post.author = cls.raoni.key
    cls.raoni_post.institution = cls.splab.key
    cls.raoni_post.put()
    # Another post of Raoni
    cls.raoni_post2 = Post()
    cls.raoni_post2.title = "Novwdfsadsssdo edital do CERTBIO"
    cls.raoni_post2.text = "At vero eos et accusamus et iusto odio dignissimos \
        ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti \
        delectus, ut aut reiciendis voluptatibus maiores alias consequatur \
        aut perferendis doloribus asperiores repellat."
    cls.raoni_post2.author = cls.raoni.key
    cls.raoni_post2.institution = cls.certbio.key
    cls.raoni_post2.put()
    # POST of Ruan To Certbio Institution
    cls.ruan_post = Post()
    cls.ruan_post.title = "Novwdfssdo edital do CERTBIO"
    cls.ruan_post.text = "At vero eos et accusamus et iusto odio dignissimos \
        emporibus autem quibusdam et aut officiis debitis aut rerum \
        necessitatibus saepe eveniet ut et voluptates repudiandae sint \
        et molestiae non recusandae. Itaque earum rerum hic tenetur sapiente \
        delectus, ut aut reiciendis voluptatibus maiores alias consequatur \
        aut perferendis doloribus asperiores repellat."
    cls.ruan_post.author = cls.ruan.key
    cls.ruan_post.institution = cls.certbio.key
    cls.ruan_post.put()


def suite():
    """Creating a suite of tests."""
    suite = unittest.TestSuite()
    suite.addTest(PostHandlerTest('test_delete'))
    return suite

if __name__ == '__main__':
    unittest.TextTestRunner(verbosity=2).run(suite())
