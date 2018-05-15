# -*- coding: utf-8 -*-
"""Institution request handler test."""

import json
from test_base_handler import TestBaseHandler
from handlers.institution_request_collection_handler import InstitutionRequestCollectionHandler
from models import Invite

from mock import patch
import mocks


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

    @patch.object(Invite, 'send_invite')
    @patch('utils.verify_token', return_value={'email': 'otheruser@test.com'})
    def test_post(self, verify_token, send_invite):
        """Test handler post."""
        # Initialize objects
        self.other_user = mocks.create_user()
        self.address = mocks.create_address()
        self.new_inst = mocks.create_institution()
        self.new_inst.name = "Departamento do Complexo Industrial e Inovação em Saúde"
        self.new_inst.acronym = "DECIIS"
        self.new_inst.trusted = True
        self.new_inst.address = self.address
        self.new_inst.put()

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
        body = {"data": data}

        response = self.testapp.post_json(InstitutionRequestCollectionHandlerTest.REQUEST_URI, body)
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

        self.assertEqual(
            request['requested_inst_name'],
            "Departamento do Complexo Industrial e Inovação em Saúde",
            "Expected institution_requested be new inst")

        send_invite.assert_called_with('localhost:80', None)
