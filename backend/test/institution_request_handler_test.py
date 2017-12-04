# -*- coding: utf-8 -*-
"""Institution Request Handler Test."""

import json
from test_base_handler import TestBaseHandler
from models.user import User
from models.institution import Institution
from models.institution import Address
from models.request_institution import RequestInstitution
from handlers.institution_request_handler import InstitutionRequestHandler

from mock import patch


class InstitutionRequestHandlerTest(TestBaseHandler):
    """Institution Request Handler Test."""

    REQUEST_URI = "/api/requests/(.*)/institution"

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(InstitutionRequestHandlerTest, cls).setUp()
        app = cls.webapp2.WSGIApplication(
            [(InstitutionRequestHandlerTest.REQUEST_URI, InstitutionRequestHandler),
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)
        initModels(cls)

    @patch('utils.verify_token', return_value={'email': 'useradmin@test.com'})
    def test_get(self, verify_token):
        """Test handler get."""
        response = self.testapp.get('/api/requests/' + self.request.key.urlsafe() + '/institution')
        request = json.loads(response._app_iter[0])

        self.assertEqual(
            request,
            self.request.make(),
            "Expected make must be equal to make of request")

    @patch('utils.verify_token', return_value={'email': 'otheruser@test.com'})
    def test_get_fail(self, verify_token):
        """Test fail get."""
        with self.assertRaises(Exception) as ex:
            self.testapp.get('/api/requests/' + self.request.key.urlsafe() + '/institution')

        message = self.get_message_exception(str(ex.exception))
        self.assertEqual(
            message,
            'Error! User is not allowed to get requests',
            "Expected message must be equal to Error! User is not allowed to get requests")

    @patch('utils.verify_token', return_value={'email': 'useradmin@test.com'})
    def test_put(self, verify_token):
        """Test handler put."""
        self.testapp.put('/api/requests/' + self.request.key.urlsafe() + '/institution')
        new_inst = self.new_inst.key.get()
        user = self.other_user.key.get()

        self.assertEqual(
            new_inst.state,
            'active',
            "Expected state must be equal to active")

        self.assertEqual(
            user.state,
            'active',
            "Expected state must be equal to active")

        self.assertEqual(
            user.key,
            new_inst.admin,
            "Expected admin must be equal to Other User")

        self.assertTrue(
            new_inst.key in user.institutions,
            "Expected new_ins in user institutions")

        self.assertTrue(
            new_inst.key in user.follows,
            "Expected new_ins in user follows")

        self.assertTrue(
            new_inst.key in user.institutions_admin,
            "Expected new_ins in user institutions_admin")

        self.assertTrue(
            user.key in new_inst.followers,
            "Expected Other User in user institution followers")

        self.assertTrue(
            user.key in new_inst.members,
            "Expected Other User in user institution members")

    @patch('utils.verify_token', return_value={'email': 'useradmin@test.com'})
    def teste_delete(self, verify_token):
        """Test handler delete."""
        self.testapp.delete('/api/requests/' + self.request.key.urlsafe() + '/institution')
        new_inst = self.new_inst.key.get()

        self.assertEqual(
            new_inst.state,
            'inactive',
            "Expected state must be equal to inactive")


def initModels(cls):
    """Init the models."""
    # new User
    cls.user_admin = User()
    cls.user_admin.name = 'User Admin'
    cls.user_admin.email = ['useradmin@test.com']
    cls.user_admin.put()
    # Other user
    cls.other_user = User()
    cls.other_user.name = 'Other User'
    cls.other_user.email = ['otheruser@test.com']
    cls.other_user.put()
    # new institution address
    cls.address = Address()
    cls.address.street = "street"
    # new Institution inst test
    cls.inst_test = Institution()
    cls.inst_test.name = 'inst test'
    cls.inst_test.photo_url = 'images/photo.jpg'
    cls.inst_test.members = [cls.user_admin.key]
    cls.inst_test.followers = [cls.user_admin.key]
    cls.inst_test.admin = cls.user_admin.key
    cls.inst_test.address = cls.address
    cls.inst_test.put()
    # new Institution inst requested to be parent of inst test
    cls.new_inst = Institution()
    cls.new_inst.name = 'new_inst'
    cls.new_inst.photo_url = 'images/photo.jpg'
    cls.new_inst.address = cls.address
    cls.new_inst.put()
    # Update Institutions admin by other user
    cls.other_user.institutions_admin = [cls.new_inst.key]
    cls.other_user.put()

    cls.user_admin.permissions['analyze_request_inst'] = {cls.inst_test.key.urlsafe() : True}
    cls.user_admin.put()
    # new Request
    cls.request = RequestInstitution()
    cls.request.sender_key = cls.other_user.key
    cls.request.is_request = True
    cls.request.admin_key = cls.other_user.key
    cls.request.institution_key = cls.new_inst.key
    cls.request.institution_requested_key = cls.inst_test.key
    cls.request.type_of_invite = 'REQUEST_INSTITUTION'
    cls.request.put()
