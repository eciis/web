# -*- coding: utf-8 -*-
"""Institution follower handler test."""
from test_base_handler import TestBaseHandler
from models.user import User
from models.institution import Institution
from handlers.institution_followers_handler import InstitutionFollowersHandler

from mock import patch


class InstitutionFollowersHandlerTest(TestBaseHandler):
    """Test the institution_followers_handler class."""

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(InstitutionFollowersHandlerTest, cls).setUp()
        app = cls.webapp2.WSGIApplication(
            [("/api/institutions/(.*)/followers",
                InstitutionFollowersHandler)
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)
        initModels(cls)

    @patch('utils.verify_token', return_value={'email': 'user1@email.com'})
    def test_post(self, verify_token):
        """Test the institution_follower_handler post method."""
        # Verified objects, are empty
        self.assertEquals(len(self.inst1.followers), 0,
                          "The number of followers expected was 0")
        self.assertEquals(len(self.user1.follows), 0,
                          "The number of follows expected was 0")
        # Call the post method
        self.testapp.post("/api/institutions/%s/followers" %
                          self.inst1.key.urlsafe())

        # Update the objects
        self.user1 = self.user1.key.get()
        self.inst1 = self.inst1.key.get()

        # An institution have 1 follower
        self.assertEquals(len(self.user1.follows), 1,
                          "The number of follows expected was 1")
        # An user have 1 follow
        self.assertEquals(len(self.inst1.followers), 1,
                          "The number of followers expected was 1")
        # Institution have user1 in followers
        self.assertTrue(self.user1.key in self.inst1.followers,
                        "Mayze should be in institution followers")
        self.assertTrue(self.inst1.key in self.user1.follows,
                        "SpLab should be in user follows")

        # Call the post method again
        self.testapp.post("/api/institutions/%s/followers" %
                          self.inst1.key.urlsafe())
        # Confirmed that follow only one time
        self.assertEquals(len(self.inst1.followers), 1,
                          "The number of followers expected was 1")
        self.assertEquals(len(self.user1.follows), 1,
                          "The number of follows expected was 1")

    @patch('utils.verify_token', return_value={'email': 'user1@email.com'})
    def test_delete(self, verify_token):
        """Test the institution_follower_handler delete method."""
        # Verified objects
        self.assertEquals(len(self.inst1.followers), 0,
                          "The number of followers expected was 0")
        self.assertEquals(len(self.user1.follows), 0,
                          "The number of follows expected was 0")

        # Call the post method
        self.testapp.post("/api/institutions/%s/followers" %
                          self.inst1.key.urlsafe())

        # Update the objects
        self.user1 = self.user1.key.get()
        self.inst1 = self.inst1.key.get()

        # Verified objects
        self.assertEquals(len(self.inst1.followers), 1,
                          "The number of followers expected was 1")
        self.assertEquals(len(self.user1.follows), 1,
                          "The number of follows expected was 1")

        # Call the delete method
        self.testapp.delete("/api/institutions/%s/followers" %
                            self.inst1.key.urlsafe())

        # Update the objects
        self.user1 = self.user1.key.get()
        self.inst1 = self.inst1.key.get()

        # Remove one follower. Admin can unfollow
        self.assertEquals(len(self.user1.follows), 0,
                          "The number of follows expected was 0")
        self.assertEquals(len(self.inst1.followers), 0,
                          "Number of followers expected was 0")

    @patch('utils.verify_token', return_value={'email': 'user2@email.com'})
    def teste_delete_usermember(self, verify_token):
        """Test that user member try unfollow the institution."""
        # Verified objects
        self.assertEquals(len(self.inst1.followers), 0,
                          "The number of followers expected was 0")
        self.assertEquals(len(self.user2.follows), 0,
                          "The number of follows expected was 0")

        # Call the delete method
        self.testapp.post("/api/institutions/%s/followers" %
                          self.inst1.key.urlsafe())

        # Update the objects
        self.user2 = self.user2.key.get()
        self.inst1 = self.inst1.key.get()

        # Verified objects
        self.assertEquals(len(self.inst1.followers), 1,
                          "The number of followers expected was 1")
        self.assertEquals(len(self.user2.follows), 1,
                          "The number of follows expected was 1")

        # Call the delete method
        self.testapp.delete("/api/institutions/%s/followers" %
                            self.inst1.key.urlsafe())

        # Update the objects
        self.user2 = self.user2.key.get()
        self.inst1 = self.inst1.key.get()

        # Don't remove users are members of institution
        self.assertEquals(len(self.user2.follows), 1,
                          "The number of follows expected was 1")
        self.assertEquals(len(self.inst1.followers), 1,
                          "Number of followers expected was 1")

    def tearDown(cls):
        """Deactivate the test."""
        cls.test.deactivate()


def initModels(cls):
    """Init the models."""
    # new User1
    cls.user1 = User()
    cls.user1.name = 'User 1'
    cls.user1.cpf = '089.675.908-90'
    cls.user1.email = ['user1@email.com']
    cls.user1.institutions = []
    cls.user1.follows = []
    cls.user1.institutions_admin = []
    cls.user1.notifications = []
    cls.user1.posts = []
    cls.user1.put()
    # new User2
    cls.user2 = User()
    cls.user2.name = 'User 2'
    cls.user2.cpf = '089.675.908-91'
    cls.user2.email = ['user2@email.com']
    cls.user2.institutions = []
    cls.user2.follows = []
    cls.user2.institutions_admin = []
    cls.user2.notifications = []
    cls.user2.posts = []
    cls.user2.put()
    # new Inst1
    cls.inst1 = Institution()
    cls.inst1.name = 'Inst 1'
    cls.inst1.acronym = 'Inst 1'
    cls.inst1.cnpj = '18.104.068/0001-86'
    cls.inst1.legal_nature = 'public'
    cls.inst1.actuation_area = ''
    cls.inst1.description = 'Ensaio Químico - Determinação de Material Volátil por \
            Gravimetria e Ensaio Biológico - Ensaio de Citotoxicidade'
    cls.inst1.email = 'inst1@email.com'
    cls.inst1.phone_number = '(83) 3322 4455'
    cls.inst1.members = [cls.user2.key]
    cls.inst1.followers = []
    cls.inst1.posts = []
    cls.inst1.admin = cls.user1.key
    cls.inst1.put()

    # Update user
    cls.user2.institutions = [cls.inst1.key]
    cls.user2.put()
