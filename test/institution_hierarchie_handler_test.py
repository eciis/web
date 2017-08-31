# -*- coding: utf-8 -*-
"""Institution hierarchie handler test."""

from test_base_handler import TestBaseHandler
from models.user import User
from models.institution import Institution
from handlers.institution_hierarchie_handler import InstitutionHierarchieHandler
from mock import patch


class InstitutionHierarchieHandlerTest(TestBaseHandler):
    """Test Institution Hierarchie Handler class."""

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(InstitutionHierarchieHandlerTest, cls).setUp()
        methods = set(cls.webapp2.WSGIApplication.allowed_methods)
        methods.add('PATCH')
        cls.webapp2.WSGIApplication.allowed_methods = frozenset(methods)
        app = cls.webapp2.WSGIApplication(
            [("/api/institutions/(.*)/hierarchie/(.*)", InstitutionHierarchieHandler)
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)
        initModels(cls)

    @patch('utils.verify_token', return_value={'email': 'mayzabeel@gmail.com'})
    def test_delete_child_connection(self, verify_token):
        """Test delete method with isParent=false."""
        # Set the institutions' state to active
        self.certbio.state = "active"
        self.splab.state = "active"
        self.splab.put()
        self.certbio.put()
        # Assert the initial conditions
        self.assertTrue(self.splab.key in self.certbio.children_institutions)
        self.assertTrue(self.splab.parent_institution == self.certbio.key)
        # Call the delete method
        self.testapp.delete("/api/institutions/%s/hierarchie/%s?isParent=false" %
                            (self.certbio.key.urlsafe(), self.splab.key.urlsafe()))
        # Update the institutions
        self.certbio = self.certbio.key.get()
        self.splab = self.splab.key.get()
        # Assert the final conditions
        self.assertTrue(
            self.splab.key not in self.certbio.children_institutions)
        self.assertTrue(self.splab.parent_institution == self.certbio.key)

    @patch('utils.verify_token', return_value={'email': 'raoni.smaneoto@ccc.ufcg.edu.br'})
    def test_delete_parent_connection(self, verify_token):
        """Test delete method with isParent=true."""
        # Set the institutions' state to active
        self.certbio.state = "active"
        self.splab.state = "active"
        self.splab.put()
        self.certbio.put()
        # Assert the initial conditions
        self.assertTrue(self.splab.key in self.certbio.children_institutions)
        self.assertTrue(self.splab.parent_institution == self.certbio.key)
        # Call the delete method
        self.testapp.delete("/api/institutions/%s/hierarchie/%s?isParent=true" %
                            (self.splab.key.urlsafe(), self.certbio.key.urlsafe()))
        # Update the institutions
        self.certbio = self.certbio.key.get()
        self.splab = self.splab.key.get()
        # Assert the final conditions
        self.assertTrue(
            self.splab.key in self.certbio.children_institutions)
        self.assertTrue(self.splab.parent_institution is None)

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
    # new User Raoni
    cls.raoni = User()
    cls.raoni.name = 'Raoni Smaneoto'
    cls.raoni.cpf = '089.675.908-65'
    cls.raoni.email = 'raoni.smaneoto@ccc.ufcg.edu.br'
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
    cls.certbio.address = 'Universidade Federal de Campina Grande'
    cls.certbio.occupation_area = ''
    cls.certbio.description = 'Ensaio Químico'
    cls.certbio.email = 'certbio@ufcg.edu.br'
    cls.certbio.phone_number = '(83) 3322 4455'
    cls.certbio.members = [cls.mayza.key, cls.raoni.key]
    cls.certbio.followers = [cls.mayza.key, cls.raoni.key]
    cls.certbio.posts = []
    cls.certbio.admin = cls.mayza.key
    cls.certbio.put()
    cls.mayza.institutions_admin = [cls.certbio.key]
    cls.mayza.put()
    # new Institution SPLAB
    cls.splab = Institution()
    cls.splab.name = 'SPLAB'
    cls.splab.acronym = 'SPLAB'
    cls.splab.cnpj = '18.104.068/0000-86'
    cls.splab.legal_nature = 'public'
    cls.splab.address = 'Universidade Federal de Campina Grande'
    cls.splab.occupation_area = ''
    cls.splab.email = 'splab@ufcg.edu.br'
    cls.splab.phone_number = '(83) 3322 4455'
    cls.splab.members = [cls.mayza.key, cls.raoni.key]
    cls.splab.followers = [cls.mayza.key, cls.raoni.key]
    cls.splab.posts = []
    cls.splab.admin = cls.raoni.key
    cls.splab.parent_institution = cls.certbio.key
    cls.splab.put()
    cls.raoni.institutions_admin = [cls.splab.key]
    cls.raoni.put()
    cls.certbio.children_institutions.append(cls.splab.key)
    cls.certbio.put()
