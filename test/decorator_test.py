# -*- coding: utf-8 -*-
"""Decorator test."""

import unittest
import sys
sys.path.append("../")
sys.path.insert(1, '/usr/local/google_appengine')
sys.path.insert(1, 'google-cloud-sdk/platform/google_appengine')
sys.path.insert(1, 'google-cloud-sdk/platform/google_appengine/lib/yaml/lib')
sys.path.insert(1, 'myapp/lib')

from models.post import Post
from utils import NotAuthorizedException
from models.user import User
from models.intitution import Institution
from utils import is_authorized
from google.appengine.ext import testbed
from google.appengine.ext import ndb


class TestIsAuthorized(unittest.TestCase):
    """Test class."""

    @classmethod
    def setUp(cls):
        """Create the objects."""
        #Initiate appengine services
        cls.self.testbed = testbed.Testbed()
        cls.testbed.activate()
        cls.testbed.init_datastore_v3_stub()
        ndb.get_context().clear_cache()

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
        non provident, similique sunt in culpa qui officia deserunt mollitia \
        id est laborum et dolorum fuga. Et harum quidem rerum facilis est et \
        xpedita distinctio. Nam libero tempore, cum soluta nobis est eligendi \
        optio cumque nihil impedit quo minus id quod maxime placeat facere \
        possimus, omnis voluptas assumenda est, omnis dolor repellendus. \
        emporibus autem quibusdam et aut officiis debitis aut rerum \
        necessitatibus saepe eveniet ut et voluptates repudiandae sint \
        et molestiae non recusandae. Itaque earum rerum hic tenetur sapiente \
        delectus, ut aut reiciendis voluptatibus maiores alias consequatur \
        aut perferendis doloribus asperiores repellat."
        cls.mayza_post.author = cls.mayza.key
        cls.mayza_post.institution = cls.certbio.key
        cls.mayza_post.put()

        def test_is_authorized(self):
            """Test the is_authorized method."""
            with self.assertRaises(NotAuthorizedException) as Aex:
                self.is_decorated(self.raoni, self.mayza_post.key)
            self.assertEqual(str(Aex.exception),
                             'User is not allowed to remove this post')

        def tearDown(self):
            self.testbed.deactivate()


@is_authorized
def is_decorated(self, user, key):
    """Allow the system test the decorator."""
    pass
