# -*- coding: utf-8 -*-
"""Institution request handler test."""

import json
from test_base_handler import TestBaseHandler
from models.user import User
from models.institution import Institution
from models.institution import Address
from handlers.institution_request_collection_handler import InstitutionRequestCollectionHandler

from mock import patch


class InstitutionRequestCollectionHandlerTest(TestBaseHandler):
    """Test the handler InstitutionChildrenRequestCollectionHandler."""

    REQUEST_URI = "/api/institutions/requests/institution/"

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(InstitutionRequestCollectionHandlerTest, cls).setUp()
        app = cls.webapp2.WSGIApplication(
            [("/api/institutions/requests/institution/(.*)", InstitutionRequestCollectionHandler),
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)
        initModels(cls)

    @patch('utils.verify_token', return_value={'email': 'otheruser@test.com'})
    def test_post(self, verify_token):
        """Test handler post."""
        data = {
            'sender_key': self.other_user.key.urlsafe(),
            'name': 'new_inst',
            'admin': {
                'name': 'Other User'
            },
            'acronym': 'ni',
            'address': {
                'street': 'street'
            },
            'type_of_invite': 'REQUEST_INSTITUTION'
        }

        response = self.testapp.post_json(InstitutionRequestCollectionHandlerTest.REQUEST_URI, data)
        request = json.loads(response._app_iter[0])

        self.assertEqual(
            request['status'],
            'sent',
            "Expected status must be equal to sent")

        self.assertEqual(
            request['sender'][0],
            'otheruser@test.com',
            "Expected sender email must be equal to otheruser@test.com")

        self.assertEqual(
            request['admin_name'],
            'Other User',
            "Expected admin_name must be equal to Other User")

        self.assertEqual(
            request['institution']['name'],
            'new_inst',
            "Expected institution name must be equal to new_inst")

        self.assertEqual(
            request['type_of_invite'],
            'REQUEST_INSTITUTION',
            "Expected type_of_invite must be equal to REQUEST_INSTITUTION")


def initModels(cls):
    """Init the models."""
    # Other user
    cls.other_user = User()
    cls.other_user.name = 'Other User'
    cls.other_user.email = ['otheruser@test.com']
    cls.other_user.put()
    # new Institution Address
    cls.address = Address()
    cls.address.number = '01'
    cls.address.street = 'street'
    # new Institution inst requested to be parent of inst test
    cls.new_inst = Institution()
    cls.new_inst.name = 'Complexo Industrial da Saude'
    cls.new_inst.photo_url = 'images/photo.jpg'
    cls.new_inst.address = cls.address
    cls.new_inst.put()
