# -*- coding: utf-8 -*-
"""Institution follower handler test."""
from test_base import TestBaseHandler
from models.user import User
from models.institution import Institution
from handlers.institution_followers_handler import InstitutionFollowersHandler


class InstitutionFollowersHandlerTest(TestBaseHandler):
    """Test the institution_followers_handler class."""

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(InstitutionFollowersHandlerTest, cls).setUp()

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

        # Verified objects
        self.assertTrue(len(self.certbio.followers) == 0, "The number of followers expected was 0")
        self.assertTrue(len(self.mayza.follows) == 0, "The number of follows expected was 0")

        # Call the post method
        self.testapp.post("/api/institution/%s/followers" % self.certbio.key.urlsafe())

        # Update the objects
        self.mayza = self.mayza.key.get()
        self.certbio = self.certbio.key.get()

        # Verified objects
        self.assertTrue(len(self.certbio.followers) == 1, "The number of followers expected was 1")
        self.assertTrue(len(self.mayza.follows) == 1, "The number of follows expected was 1")

        # Call the delete method
        self.testapp.delete("/api/institution/%s/followers" % self.certbio.key.urlsafe())

        # Update the objects
        self.mayza = self.mayza.key.get()
        self.certbio = self.certbio.key.get()

        # Remove one follower. Admin can unfollow
        self.assertTrue(len(self.mayza.follows) == 0, "The number of follows expected was 0")
        self.assertTrue(len(self.certbio.followers) == 0, "Number of followers expected was 0")

    def teste_delete_usermember(self):
        """Test that user member try unfollow the institution."""
        # Pretend an authentication
        self.os.environ['REMOTE_USER'] = 'maiana.brito@ccc.ufcg.edu.br'
        self.os.environ['USER_EMAIL'] = 'maiana.brito@ccc.ufcg.edu.br'

        # Verified objects
        self.assertTrue(len(self.certbio.followers) == 0, "The number of followers expected was 0")
        self.assertTrue(len(self.maiana.follows) == 0, "The number of follows expected was 0")

        # Call the delete method
        self.testapp.post("/api/institution/%s/followers" % self.certbio.key.urlsafe())

        # Update the objects
        self.maiana = self.maiana.key.get()
        self.certbio = self.certbio.key.get()

        # Verified objects
        self.assertTrue(len(self.certbio.followers) == 1, "The number of followers expected was 1")
        self.assertTrue(len(self.mayza.follows) == 1, "The number of follows expected was 1")

        # Call the delete method
        self.testapp.delete("/api/institution/%s/followers" % self.certbio.key.urlsafe())

        # Update the objects
        self.maiana = self.maiana.key.get()
        self.certbio = self.certbio.key.get()

        # Don't remove users are members of institution
        self.assertTrue(len(self.maiana.follows) == 1, "The number of follows expected was 1")
        self.assertTrue(len(self.certbio.followers) == 1, "Number of followers expected was 1")

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
    cls.maiana.cpf = '089.675.908-91'
    cls.maiana.email = 'maiana.brito@ccc.ufcg.edu.br'
    cls.maiana.institutions = []
    cls.maiana.follows = []
    cls.maiana.institutions_admin = []
    cls.maiana.notifications = []
    cls.maiana.posts = []
    cls.maiana.put()
    # new Institution CERTBIO, user Maiana is follower
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
    cls.certbio.members = [cls.maiana.key]
    cls.certbio.followers = []
    cls.certbio.posts = []
    cls.certbio.admin = cls.mayza.key
    cls.certbio.put()

    # Update user
    cls.maiana.institutions = [cls.certbio.key]
    cls.maiana.put()
