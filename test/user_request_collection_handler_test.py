# -*- coding: utf-8 -*-
"""User request handler collection test."""

import json
from test_base_handler import TestBaseHandler
from models.user import User
from models.institution import Institution
from models.institution import Address
from handlers.user_request_collection_handler import UserRequestCollectionHandler

from mock import patch


class UserRequestCollectionHandlerTest(TestBaseHandler):
    """Test the handler UserRequestCollectionHandler."""

    REQUEST_URI = "/api/institutions/(.*)/requests/user"

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(UserRequestCollectionHandlerTest, cls).setUp()
        app = cls.webapp2.WSGIApplication(
            [(UserRequestCollectionHandlerTest.REQUEST_URI,
             UserRequestCollectionHandler)], debug=True)
        cls.testapp = cls.webtest.TestApp(app)
        initModels(cls)

    @patch('utils.verify_token', return_value={'email': 'other_user@test.com'})
    def test_post(self, verify_token):
        """Test method post of UserRequestHandler."""
        data = {
            'sender_key': self.other_user.key.urlsafe(),
            'is_request': True,
            'admin_key': self.user_admin.key.urlsafe(),
            'institution_key': self.inst_test.key.urlsafe(),
            'type_of_invite': 'REQUEST_USER',
            'sender_name': "user name updated",
            'office': 'CEO',
            'institutional_email': 'other@ceo.com'
        }

        request = self.testapp.post_json(
            "/api/institutions/" +
            self.inst_test.key.urlsafe() +
            "/requests/user", data
        )

        request = json.loads(request._app_iter[0])

        user_updated = self.other_user.key.get()

        self.assertEqual(
            request['sender'],
            self.other_user.email,
            'Expected sender email is other_user@test.com')
        self.assertEqual(
            request['admin_name'],
            self.user_admin.name,
            'Expected sender admin_name is User Admin')
        self.assertEqual(
            request['admin_name'],
            self.user_admin.name,
            'Expected sender admin_name is User Admin')
        self.assertEqual(
            len(user_updated.institution_profiles),
            1, 'Expected one profile in user profiles')
        self.assertEqual(
            user_updated.name, 'user name updated',
            'Expected new user name is user name updated')

    @patch('utils.verify_token', return_value={'email': 'other_user@test.com'})
    def test_post_invalid_request_type(self, verify_token):
        """Test if an exception is thrown by passing an invalid request."""
        data = {
            'sender_key': self.other_user.key.urlsafe(),
            'is_request': True,
            'admin_key': self.user_admin.key.urlsafe(),
            'institution_key': self.inst_test.key.urlsafe(),
            'type_of_invite': 'INVITE',
            'sender_name': self.other_user.name,
            'office': 'CEO',
            'institutional_email': 'other@ceo.com'
        }

        with self.assertRaises(Exception) as ex:
            self.testapp.post_json(
                "/api/institutions/" + self.inst_test.key.urlsafe() +
                "/requests/user", data)

        exception_message = self.get_message_exception(ex.exception.message)
        self.assertEqual(
            'Error! The type must be REQUEST_USER',
            exception_message,
            "Expected error message is Error! The type must be REQUEST_USER")


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
    cls.other_user.email = ['other_user@test.com']
    cls.other_user.put()
    # new institution address
    cls.address = Address()
    cls.address.street = "street"
    # new Institution inst test
    cls.inst_test = Institution()
    cls.inst_test.name = 'inst test'
    cls.inst_test.address = cls.address
    cls.inst_test.members = [cls.user_admin.key]
    cls.inst_test.followers = [cls.user_admin.key]
    cls.inst_test.admin = cls.user_admin.key
    cls.inst_test.put()
