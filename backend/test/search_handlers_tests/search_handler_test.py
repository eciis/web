# -*- coding: utf-8 -*-
"""Search handler test."""

from ..test_base_handler import TestBaseHandler
from handlers.search_handler import SearchHandler
from mock import patch
from .. import mocks

USER = {'email': 'test@example.com'}

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

    @patch('util.login_service.verify_token', return_value=USER)
    def test_get_institution(self, verify_token):
        """Test the search_handler's get method."""
        splab = mocks.create_institution()
        splab.name = 'Software Practice Laboratory'
        splab.acronym = 'SPLAB'
        splab.state = 'pending'
        splab.actuation_area = 'Universidades'
        splab.put()
        certbio = mocks.create_institution()
        certbio.name = 'Laboratório de Avaliação e Desenvolvimento de Biomateriais do Nordeste'
        certbio.acronym = 'CERTBIO'
        certbio.state = 'active'
        certbio.actuation_area = 'Universidades'
        certbio.description = 'Ensaio Químico - Determinação de Material Volátil por Gravimetria...'
        certbio.put()
        # Search for the institution by its full name
        institutions = self.testapp.get(
            "/api/search/institution?value=%s&state=%s&type=institution"
            % (certbio.name, 'active'))
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
        # Search for institutions by description
        institutions = self.testapp.get(
            "/api/search/institution?value=%s&state=%s&type=institution"
            % ('Ensaio quimico', 'active'))
        self.assertTrue('CERTBIO' in institutions)

    @patch('util.login_service.verify_token', return_value=USER)
    def test_get_user(self, verify_token):
        """Test the search_handler's get method with type=user."""
        user = mocks.create_user(USER['email'])
        user.name = "User Example"
        user.put()
        # Call the get method with the user's full name
        users = self.testapp.get(
            "/api/search/institution?value=%s&state=%s&type=user"
            % (user.name, user.state))
        self.assertTrue("User" in users)
        # Call the get method with part of the user's name
        users = self.testapp.get(
            "/api/search/institution?value=%s&state=%s&type=user"
            % ("User", user.state))
        self.assertTrue("User" in users)
