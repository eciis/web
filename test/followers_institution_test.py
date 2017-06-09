# -*- coding: utf-8 -*-
"""Institution follower handler test."""
import unittest
from test_base import TestBase
from models.user import User
from models.institution import Institution
from handlers.institution_followers_handler import InstitutionFollowersHandler


class InstitutionFollowersHandlerTest(TestBase):
    """Test the institution_followers_handler class."""

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

    def test_post(self):
        """Test the institution_follower_handler post method."""
        # Pretend an authentication
        self.os.environ['REMOTE_USER'] = 'mayzabeel@gmail.com'
        self.os.environ['USER_EMAIL'] = 'mayzabeel@gmail.com'
        # Verified objects, are empty
        self.assertTrue(len(self.certbio.followers) == 0, "The number of followers expected was 0")
        self.assertTrue(len(self.mayza.follows) == 0, "The number of follows expected was 0")
        # Call the post method
        self.testapp.post("/api/institution/%s/followers" % self.certbio.key.urlsafe())

        # Update the objects
        self.mayza = self.mayza.key.get()
        self.certbio = self.certbio.key.get()

        # An institution have 1 follower
        self.assertTrue(len(self.mayza.follows) == 1, "The number of follows expected was 1")
        # An user have 1 follow
        self.assertTrue(len(self.certbio.followers) == 1, "The number of followers expected was 1")
        # Institution have mayza in followers
        self.assertTrue(self.mayza.key in self.certbio.followers, "Mayze should be in institution followers")
        self.assertTrue(self.certbio.key in self.mayza.follows, "SpLab should be in user follows")

        # Call the post method again
        self.testapp.post("/api/institution/%s/followers" % self.certbio.key.urlsafe())
        # Confirmed that follow only one time
        self.assertTrue(len(self.certbio.followers) == 1, "The number of followers expected was 1")
        self.assertTrue(len(self.mayza.follows) == 1, "The number of follows expected was 1")

    def test_delete(self):
        """Test the institution_follower_handler delete method."""
        # Pretend an authentication
        self.os.environ['REMOTE_USER'] = 'mayzabeel@gmail.com'
        self.os.environ['USER_EMAIL'] = 'mayzabeel@gmail.com'
        # Verified objects, are empty
        self.assertTrue(len(self.certbio.followers) == 0, "The number of followers expected was 0")
        self.assertTrue(len(self.mayza.follows) == 0, "The number of follows expected was 0")
        # Call the delete method
        self.testapp.delete("/api/institution/%s/followers" % self.certbio.key.urlsafe())

        # Update the objects
        self.mayza = self.mayza.key.get()
        self.certbio = self.certbio.key.get()

        # Don't changed
        self.assertTrue(len(self.mayza.follows) == 0, "The number of follows expected was 0")
        self.assertTrue(len(self.certbio.followers) == 0, "The number of followers expected was 0")

        # Call the post method
        self.testapp.post("/api/institution/%s/followers" % self.certbio.key.urlsafe())

        self.mayza = self.mayza.key.get()
        self.certbio = self.certbio.key.get()

        self.assertTrue(len(self.certbio.followers) == 1, "The number of followers expected was 1")
        self.assertTrue(len(self.mayza.follows) == 1, "The number of follows expected was 1")

        # Call the delete method
        self.testapp.delete("/api/institution/%s/followers" % self.certbio.key.urlsafe())

        # Update the objects
        self.mayza = self.mayza.key.get()
        self.certbio = self.certbio.key.get()

        # Remove one follower
        self.assertTrue(len(self.mayza.follows) == 1, "The number of follows expected was 0")
        self.assertTrue(len(self.certbio.followers) == 0, "The number of followers expected was 0")

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
    cls.certbio.members = [cls.mayza.key]
    cls.certbio.followers = []
    cls.certbio.posts = []
    cls.certbio.admin = cls.mayza.key
    cls.certbio.put()
