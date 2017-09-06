# -*- coding: utf-8 -*-
"""User profile handler test."""

from test_base_handler import TestBaseHandler
from handlers.user_profile_handler import UserProfileHandler

from models.user import User
from models.user import InstitutionProfile
from models.institution import Institution

import json

from mock import patch


class UserProfileHandlerTest(TestBaseHandler):
    """Test the UserProfileHandler class."""

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(UserProfileHandlerTest, cls).setUp()
        methods = set(cls.webapp2.WSGIApplication.allowed_methods)
        methods.add('PATCH')
        cls.webapp2.WSGIApplication.allowed_methods = frozenset(methods)
        app = cls.webapp2.WSGIApplication(
            [("/api/user/(.*)/profile", UserProfileHandler)
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)
        initModels(cls)

    @patch('utils.verify_token', return_value={'email': 'raoni.smaneoto@ccc.ufcg.edu.br'})
    def test_get(self, verify_token):
        """Test the get method."""
        result = self.testapp.get(
            "/api/user/%s/profile" % self.raoni.key.urlsafe())
        result = json.loads(result.body)
        self.assertEqual(result['institution_profiles'][0], self.certbio_profile.make())

    def tearDown(cls):
        """Deactivate the test."""
        cls.test.deactivate()


def initModels(cls):
    """Init the models."""
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
    cls.certbio.occupation_area = ''
    cls.certbio.description = 'Ensaio Químico'
    cls.certbio.email = 'certbio@ufcg.edu.br'
    cls.certbio.phone_number = '(83) 3322 4455'
    cls.certbio.members = [cls.raoni.key]
    cls.certbio.followers = [cls.raoni.key]
    cls.certbio.posts = []
    cls.certbio.put()
    cls.raoni.institutions.append(cls.certbio.key)
    cls.certbio_profile = InstitutionProfile()
    cls.certbio_profile.phone = '(74) 99937-357'
    cls.certbio_profile.email = 'raoni.smaneoto@ccc.ufcg.edu.br'
    cls.certbio_profile.institution_key = cls.certbio.key.urlsafe()
    cls.certbio_profile.office = "developer"
    cls.raoni.institution_profiles.append(cls.certbio_profile)
    cls.raoni.put()
