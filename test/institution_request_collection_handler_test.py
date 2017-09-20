# -*- coding: utf-8 -*-
"""Institution request handler test."""

import json
from test_base_handler import TestBaseHandler
from models.user import User
from handlers.institution_request_collection_handler import InstitutionRequestCollectionHandler

from mock import patch


class InstitutionRequestCollectionHandlerTest(TestBaseHandler):
    """Test the handler InstitutionChildrenRequestCollectionHandler."""

    REQUEST_URI = "/api/institutions/requests/institution"

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(InstitutionRequestCollectionHandlerTest, cls).setUp()
        app = cls.webapp2.WSGIApplication(
            [(InstitutionRequestCollectionHandlerTest.REQUEST_URI, InstitutionRequestCollectionHandler),
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)
        initModels(cls)

    @patch('utils.verify_token', return_value={'email': 'otheruser@test.com'})
    def test_post(self, verify_token):
        """Test handler post."""
        data = {
            'sender_key': self.other_user.key.urlsafe(),
            'name': 'new_inst',
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
            "Expected status muste be equal to sent")

        self.assertEqual(
            request['sender'],
            'otheruser@test.com',
            "Expected sender email muste be equal to otheruser@test.com")

        self.assertEqual(
            request['admin_name'],
            'Other User',
            "Expected admin_name muste be equal to Other User")

        self.assertEqual(
            request['institution']['name'],
            'new_inst',
            "Expected institution name muste be equal to new_inst")

        self.assertEqual(
            request['type_of_invite'],
            'REQUEST_INSTITUTION',
            "Expected type_of_invite muste be equal to REQUEST_INSTITUTION")


def initModels(cls):
    """Init the models."""
    # Other user
    cls.other_user = User()
    cls.other_user.name = 'Other User'
    cls.other_user.email = 'otheruser@test.com'
    cls.other_user.put()
