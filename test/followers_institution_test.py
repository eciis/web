# -*- coding: utf-8 -*-
"""Institution follower handler test."""

import unittest
from test_base import TestBase
from models.user import User
from models.institution import Institution
from handlers.institution_followers_handler import InstitutionFollowersHandler


class InstitutionFollowersHandlerTest(TestBase):
    """Test the post_handler class."""

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        cls.test = cls.testbed.Testbed()
        cls.test.activate()
        cls.policy = cls.datastore.PseudoRandomHRConsistencyPolicy(
            probability=1)
        cls.test.init_datastore_v3_stub(consistency_policy=cls.policy)
        cls.test.init_memcache_stub()
        cls.ndb.get_context().set_cache_policy(False)
        app = cls.webapp2.WSGIApplication(
            [("/api/institution/(.*)/followers",
                InstitutionFollowersHandler)
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)
        initModels(cls)

    def mayza_follow_splab(self):
        """Test with institution SPLAB and user MAYZA."""
        # Pretend an authentication
        self.os.environ['REMOTE_USER'] = 'mayzabeel@gmail.com'
        self.os.environ['USER_EMAIL'] = 'mayzabeel@gmail.com'
        # Verified objects, are empty
        self.assertTrue(len(self.splab.followers) == 0)
        self.assertTrue(len(self.mayza.follows) == 0)
        # Call the post method
        self.testapp.post("/api/institution/%s/followers" % self.splab.key.urlsafe())

        # Update the objects
        self.mayza = self.mayza.key.get()
        self.splab = self.splab.key.get()

        # An institution have 1 follower
        self.assertTrue(len(self.mayza.follows) == 1)
        # An user have 1 follow
        self.assertTrue(len(self.splab.followers) == 1)
        # Institution have mayza in followers
        self.assertTrue(self.mayza.key in self.splab.followers)
        self.assertTrue(self.splab.key in self.mayza.follows)

        # Call the post method again
        self.testapp.post("/api/institution/%s/followers" % self.splab.key.urlsafe())
        # Confirmed that follow only one time
        self.assertTrue(len(self.splab.followers) == 1)
        self.assertTrue(len(self.mayza.follows) == 1)

    def maiana_follow_certbio(self):
        """Test with institution CERTBIO and user MAIANA."""
        self.os.environ['REMOTE_USER'] = 'maiana.brito@ccc.ufcg.edu.br'
        self.os.environ['USER_EMAIL'] = 'maiana.brito@ccc.ufcg.edu.br'

        self.assertTrue(len(self.certbio.followers) == 0)
        self.assertTrue(len(self.maiana.follows) == 0)

        self.testapp.post("/api/institution/%s/followers" % self.certbio.key.urlsafe())

        # Update objects
        self.maiana = self.maiana.key.get()
        self.certbio = self.certbio.key.get()

        self.assertTrue(len(self.certbio.followers) == 1)
        self.assertTrue(len(self.maiana.follows) == 1)
        self.assertTrue(self.maiana.key in self.certbio.followers)
        self.assertTrue(self.certbio.key in self.maiana.follows)

        # Call the post method again
        self.testapp.post("/api/institution/%s/followers" % self.certbio.key.urlsafe())
        self.assertTrue(len(self.certbio.followers) == 1)

    def maiana_follow_splab(self):
        """Test with institution SPLAB and user Maiana."""
        self.os.environ['REMOTE_USER'] = 'maiana.brito@ccc.ufcg.edu.br'
        self.os.environ['USER_EMAIL'] = 'maiana.brito@ccc.ufcg.edu.br'

        self.assertTrue(len(self.splab.followers) == 1)
        self.assertTrue(len(self.maiana.follows) == 1)

        self.testapp.post("/api/institution/%s/followers" % self.splab.key.urlsafe())

        # Update objects
        self.maiana = self.maiana.key.get()
        self.splab = self.splab.key.get()

        self.assertTrue(len(self.splab.followers) == 2)
        self.assertTrue(len(self.maiana.follows) == 2)
        self.assertTrue(self.maiana.key in self.splab.followers)
        self.assertTrue(self.splab.key in self.maiana.follows)

        # Call the post method again
        self.testapp.post("/api/institution/%s/followers" % self.splab.key.urlsafe())
        self.assertTrue(len(self.splab.followers) == 2)

    def test_follow(self):
        """Test the institution_follower_handler post method."""
        self.mayza_follow_splab()
        self.maiana_follow_certbio()
        self.maiana_follow_splab()

    def test_unfollow(self):
        """Test the institution_follower_handler delete method."""
        # Pretend an authentication
        self.os.environ['REMOTE_USER'] = 'mayzabeel@gmail.com'
        self.os.environ['USER_EMAIL'] = 'mayzabeel@gmail.com'
        # Verified objects, are empty
        self.assertTrue(len(self.splab.followers) == 0)
        self.assertTrue(len(self.mayza.follows) == 0)
        # Call the delete method
        self.testapp.delete("/api/institution/%s/followers" % self.splab.key.urlsafe())

        # Update the objects
        self.mayza = self.mayza.key.get()
        self.splab = self.splab.key.get()

        # Don't changed
        self.assertTrue(len(self.mayza.follows) == 0)
        self.assertTrue(len(self.splab.followers) == 0)

        # Call the post method
        self.testapp.post("/api/institution/%s/followers" % self.splab.key.urlsafe())

        self.mayza = self.mayza.key.get()
        self.splab = self.splab.key.get()

        self.assertTrue(len(self.splab.followers) == 1)
        self.assertTrue(len(self.mayza.follows) == 1)

        # Call the delete method
        self.testapp.delete("/api/institution/%s/followers" % self.splab.key.urlsafe())

        # Update the objects
        self.mayza = self.mayza.key.get()
        self.splab = self.splab.key.get()

        # Remove one follower
        self.assertTrue(len(self.mayza.follows) == 0)
        self.assertTrue(len(self.splab.followers) == 0)

    def tearDown(cls):
        """Deactivate the test."""
        cls.test.deactivate()


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
    # new User Maiana
    cls.maiana = User()
    cls.maiana.name = 'Maiana Brito'
    cls.maiana.cpf = '089.675.908-65'
    cls.maiana.photo_url = 'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcSPmtcCROhhQIkQHhw_6elHBnO7b9jM-o_KiUtanTNbk1zRGzsnf0Fu2w'
    cls.maiana.email = 'maiana.brito@ccc.ufcg.edu.br'
    cls.maiana.institutions = []
    cls.maiana.follows = []
    cls.maiana.institutions_admin = []
    cls.maiana.notifications = []
    cls.maiana.posts = []
    cls.maiana.put()
    # new Institution CERTBIO with 1 followers.
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
    cls.certbio.members = [cls.mayza.key, cls.maiana.key]
    cls.certbio.followers = []
    cls.certbio.posts = []
    cls.certbio.admin = cls.mayza.key
    cls.certbio.put()

    # new Institution SPLAB, with 0 followers.
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
    cls.splab.members = [cls.mayza.key]
    cls.splab.followers = []
    cls.splab.posts = []
    cls.splab.admin = cls.mayza.key
    cls.splab.put()
