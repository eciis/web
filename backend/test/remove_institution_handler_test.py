# -*- coding: utf-8 -*-
"""Remove Institution Handler test."""

from test_base_handler import TestBaseHandler
from worker import RemoveInstitutionHandler
from models.user import User
from models.institution import Institution


class RemoveInstitutionHandlerTest(TestBaseHandler):
    """Test Remove Institution Handler."""

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(RemoveInstitutionHandlerTest, cls).setUp()
        methods = set(cls.webapp2.WSGIApplication.allowed_methods)
        methods.add('PATCH')
        cls.webapp2.WSGIApplication.allowed_methods = frozenset(methods)
        app = cls.webapp2.WSGIApplication(
            [
                ('/api/queue/remove-inst', RemoveInstitutionHandler)
            ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)
        initModels(cls)

    def test_post(self):
        """Test the post method."""
        # Verify the members
        self.assertTrue(self.certbio.key in self.mayza.institutions)
        self.assertTrue(self.certbio.key in self.raoni.institutions)
        # Call the post method
        self.testapp.post('/api/queue/remove-inst?institution_key=%s&remove_hierarchy=true'
                          % (self.certbio.key.urlsafe()))
        # Retrieving the entities
        self.mayza = self.mayza.key.get()
        self.raoni = self.raoni.key.get()
        # Check if the method worked as expected
        self.assertTrue(self.certbio.key not in self.mayza.institutions)
        self.assertTrue(self.certbio.key not in self.raoni.institutions)
        self.assertTrue(self.certbio.key not in self.mayza.institutions_admin)


def initModels(cls):
    """Init the models."""
    # new User Mayza
    cls.mayza = User()
    cls.mayza.name = 'Mayza Nunes'
    cls.mayza.cpf = '089.675.908-90'
    cls.mayza.email = ['mayzabeel@gmail.com']
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
    cls.raoni.email = ['raoni.smaneoto@ccc.ufcg.edu.br']
    cls.raoni.state = "pending"
    cls.raoni.institutions = []
    cls.raoni.follows = []
    cls.raoni.institutions_admin = []
    cls.raoni.notifications = []
    cls.raoni.posts = []
    cls.raoni.put()
    # new Institution CERTBIO
    cls.certbio = Institution()
    cls.certbio.name = 'CERTBIO'
    cls.certbio.acronym = 'CERTBIO'
    cls.certbio.cnpj = '18.104.068/0001-86'
    cls.certbio.legal_nature = 'public'
    cls.certbio.actuation_area = ''
    cls.certbio.description = 'Ensaio Químico'
    cls.certbio.email = 'certbio@ufcg.edu.br'
    cls.certbio.phone_number = '(83) 3322 4455'
    cls.certbio.members = [cls.mayza.key, cls.raoni.key]
    cls.certbio.followers = [cls.mayza.key, cls.raoni.key]
    cls.certbio.posts = []
    cls.certbio.admin = cls.mayza.key
    cls.certbio.put()
    cls.mayza.institutions_admin = [cls.certbio.key]
    cls.mayza.institutions.append(cls.certbio.key)
    cls.raoni.institutions.append(cls.certbio.key)
    cls.mayza.follows.append(cls.certbio.key)
    cls.raoni.follows.append(cls.certbio.key)
    cls.mayza.add_permission("publish_post", cls.certbio.key.urlsafe())
    cls.raoni.add_permission("publish_post", cls.certbio.key.urlsafe())
    cls.raoni.put()
    cls.mayza.put()
