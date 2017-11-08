# -*- coding: utf-8 -*-
"""Search handler test."""

from test_base_handler import TestBaseHandler
from models.user import User
from models.institution import Institution
from handlers.search_handler import SearchHandler

from mock import patch


class SearchHandlerTest(TestBaseHandler):
    """Test the SearchHandler class."""

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(SearchHandlerTest, cls).setUp()
        app = cls.webapp2.WSGIApplication(
            [("/api/search/institution", SearchHandler),
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)
        initModels(cls)

    @patch('utils.verify_token', return_value={'email': 'test@example.com'})
    def test_get_institution(self, verify_token):
        """Test the search_handler's get method."""
        # Search for the institution by its full name
        certbio_name = 'Lab. de Desenvolvimento de Biomateriais do Nordeste'
        institutions = self.testapp.get(
            "/api/search/institution?value=%s&state=%s&type=institution"
            % (certbio_name, 'active'))
        self.assertTrue('CERTBIO' in institutions)
        # Search for the institution by part of its name
        institutions = self.testapp.get(
            "/api/search/institution?value=%s&state=%s&type=institution"
            % ('Biomateriais', 'active'))
        self.assertTrue('CERTBIO' in institutions)
        # Search for the institution by its acronym
        institutions = self.testapp.get(
            "/api/search/institution?value=%s&state=%s&type=institution"
            % ('CERTBIO', 'active'))
        self.assertTrue('CERTBIO' in institutions)
        # Make sure that there is no institution CERTBIO with pending state.
        institutions = self.testapp.get(
            "/api/search/institution?value=%s&state=%s&type=institution"
            % ('CERTBIO', 'pending'))
        self.assertTrue('CERTBIO' not in institutions)
        # Make sure that there is no SPLAB with pending state.
        institutions = self.testapp.get(
            "/api/search/institution?value=%s&state=%s&type=institution" % ('SPLAB', 'active'))
        self.assertTrue('SPLAB' not in institutions)
        # Assert that SPLAB has a pending state
        institutions = self.testapp.get(
            "/api/search/institution?value=%s&state=%s&type=institution" % ('SPLAB', 'pending'))
        self.assertTrue('SPLAB' in institutions)
        # Search for institutions by its actuation area
        institutions = self.testapp.get(
            "/api/search/institution?value=%s&state=%s&type=institution"
            % ('Universidades', 'active, pending'))
        self.assertTrue('CERTBIO' and 'SPLAB' in institutions)

    @patch('utils.verify_token', return_value={'email': 'test@example.com'})
    def test_get_user(self, verify_token):
        """Test the search_handler's get method with type=user."""
        # Call the get method with the user's full name
        users = self.testapp.get(
            "/api/search/institution?value=%s&state=%s&type=user"
            % (self.user.name, self.user.state))
        self.assertTrue("User" in users)
        # Call the get method with part of the user's name
        users = self.testapp.get(
            "/api/search/institution?value=%s&state=%s&type=user"
            % ("User", self.user.state))
        self.assertTrue("User" in users)

    def tearDown(cls):
        """Deactivate the test."""
        cls.test.deactivate()


def initModels(cls):
    """Init the models."""
    # new User
    cls.user = User()
    cls.user.name = 'User'
    cls.user.cpf = '089.675.908-90'
    cls.user.email = ['test@example.com']
    cls.user.institutions = []
    cls.user.follows = []
    cls.user.institutions_admin = []
    cls.user.notifications = []
    cls.user.posts = []
    cls.user.put()
    # new Institution CERTBIO
    cls.certbio = Institution()
    cls.certbio.name = 'Lab. de Desenvolvimento de Biomateriais do Nordeste'
    cls.certbio.acronym = 'CERTBIO'
    cls.certbio.state = 'active'
    cls.certbio.actuation_area = 'Universidades'
    cls.certbio.members = [cls.user.key]
    cls.certbio.followers = [cls.user.key]
    cls.certbio.admin = cls.user.key
    cls.certbio.put()
    # new Institution SPLAB
    cls.splab = Institution()
    cls.splab.name = 'Software Practice Laboratory'
    cls.splab.acronym = 'SPLAB'
    cls.splab.state = 'pending'
    cls.splab.actuation_area = 'Universidades'
    cls.splab.members = [cls.user.key]
    cls.splab.followers = [cls.user.key]
    cls.splab.admin = cls.user.key
    cls.splab.put()
    # updating user institutions admin
    cls.user.institutions_admin = [cls.certbio.key, cls.splab.key]
    cls.user.put()
