# -*- coding: utf-8 -*-
"""User profile handler test."""

from test_base_handler import TestBaseHandler
from handlers.user_profile_handler import UserProfileHandler

from models import User
from models import InstitutionProfile
from models import Institution

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

    @patch('util.login_service.verify_token', return_value={'email': 'raoni.smaneoto@ccc.ufcg.edu.br'})
    def test_get(self, verify_token):
        """Test the get method."""
        result = self.testapp.get(
            "/api/user/%s/profile" % self.user.key.urlsafe())
        result = json.loads(result.body)
        self.assertEqual(result['institution_profiles'][0], self.certbio_profile.make())

    def tearDown(cls):
        """Deactivate the test."""
        cls.test.deactivate()


def initModels(cls):
    """Init the models."""
    # new User Raoni
    cls.user = User()
    cls.user.name = 'Raoni Smaneoto'
    cls.user.email = ['raoni.smaneoto@ccc.ufcg.edu.br']
    cls.user.institutions = []
    cls.user.put()
    # new Institution CERTBIO
    cls.certbio = Institution()
    cls.certbio.name = 'CERTBIO'
    cls.certbio.members = [cls.user.key]
    cls.certbio.followers = [cls.user.key]
    cls.certbio.put()
    cls.user.institutions.append(cls.certbio.key)
    cls.certbio_profile = InstitutionProfile()
    cls.certbio_profile.phone = '(74) 99937-357'
    cls.certbio_profile.email = 'raoni.smaneoto@ccc.ufcg.edu.br'
    cls.certbio_profile.institution_key = cls.certbio.key.urlsafe()
    cls.certbio_profile.office = "developer"
    cls.certbio_profile.name = cls.certbio.name
    cls.certbio_profile.photo_url = 'photourl'
    cls.certbio_profile.color = 'green'
    cls.user.institution_profiles.append(cls.certbio_profile)
    cls.user.put()
