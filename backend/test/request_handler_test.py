# -*- coding: utf-8 -*-
"""Request Handler Test."""

import json
from test_base_handler import TestBaseHandler
from models.user import User
from models.institution import Institution
from models.institution import Address
from models.request_user import RequestUser
from handlers.request_handler import RequestHandler

from mock import patch
import mock


class RequestHandlerTest(TestBaseHandler):
    """Request Handler Test."""

    REQUEST_URI = "/api/requests/(.*)/user"

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(RequestHandlerTest, cls).setUp()
        app = cls.webapp2.WSGIApplication(
            [(RequestHandlerTest.REQUEST_URI, RequestHandler),
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)
        initModels(cls)

    @patch('utils.verify_token', return_value={'email': 'useradmin@test.com'})
    def test_get(self, verify_token):
        """Test method get of RequestHandler."""
        response = self.testapp.get('/api/requests/' + self.request.key.urlsafe() + '/user')
        request = json.loads(response._app_iter[0])

        self.assertEqual(
            request['sender'],
            self.request.sender_key.get().email,
            "expected sender email must be equal to sender email of original request")

        self.assertEqual(
            request['admin_name'],
            self.request.admin_key.get().name,
            "expected admin_name must be equal to admin_name of original request")

        self.assertEqual(
            request['institution_key'],
            self.request.institution_key.urlsafe(),
            "expected institution_key must be equal to institution_key of original request")

        self.assertEqual(
            request['type_of_invite'],
            'REQUEST_USER',
            "expected type_of_invite must be equal to  REQUEST_USER")

    @patch('utils.verify_token', return_value={'email': 'otheruser@test.com'})
    def test_get_user_not_admin(self, verify_token):
        """Test get request with user is not admin."""
        with self.assertRaises(Exception) as ex:
            self.testapp.get('/api/requests/' + self.request.key.urlsafe() + '/user')

        exception_message = self.get_message_exception(ex.exception.message)
        self.assertEqual(
            "Error! User is not admin",
            exception_message,
            "Expected error message is Error! User is not admin")

    @mock.patch('handlers.request_handler.send_message_notification')
    @patch('utils.verify_token', return_value={'email': 'useradmin@test.com'})
    def test_put(self, verify_token, mock_method):
        """Test method put of RequestHandler."""
        self.testapp.put('/api/requests/' + self.request.key.urlsafe() + '/user')
        user = self.other_user.key.get()
        institution = self.inst_test.key.get()
        self.assertTrue(mock_method.called)
        self.assertEqual(
            self.request.key.get().status,
            'accepted',
            "expected status must be equal to accepted")

        self.assertTrue(
            institution.key in user.institutions,
            "key of institution must be in user institutions")

        self.assertTrue(
            institution.key in user.follows,
            "key of institution must be in user follows")

        self.assertTrue(
            user.key in institution.members,
            "key of user must be in institution members")

        self.assertTrue(
            user.key in institution.followers,
            "key of user must be in institution followers")

    @patch('utils.verify_token', return_value={'email': 'useradmin@test.com'})
    def test_put_request_accepted(self, verify_token):
        """Test put request accepted."""
        self.testapp.put('/api/requests/' + self.request.key.urlsafe() + '/user')

        with self.assertRaises(Exception) as ex:
            self.testapp.put('/api/requests/' + self.request.key.urlsafe() + '/user')

        exception_message = self.get_message_exception(ex.exception.message)
        self.assertEqual(
            "Error! this request has already been processed",
            exception_message,
            "Expected error message is Error! this request has already been processed")

    @patch('utils.verify_token', return_value={'email': 'otheruser@test.com'})
    def test_put_user_not_admin(self, verify_token):
        """Test put request with user is not admin."""
        with self.assertRaises(Exception) as ex:
            self.testapp.put('/api/requests/' + self.request.key.urlsafe() + '/user')

        exception_message = self.get_message_exception(ex.exception.message)
        self.assertEqual(
            "Error! User is not admin",
            exception_message,
            "Expected error message is Error! User is not admin")

    @patch('utils.verify_token', return_value={'email': 'useradmin@test.com'})
    def test_delete(self, verify_token):
        """Test method delete of RequestHandler."""
        self.assertEquals(
            len(self.other_user.institution_profiles),
            1, 'The other_user should have only one profile')

        self.testapp.delete('/api/requests/' +
                            self.request.key.urlsafe() + '/user')

        # update request and other_user
        self.request = self.request.key.get()
        self.other_user = self.other_user.key.get()

        self.assertEqual(self.request.status, 'rejected')
        self.assertEquals(
            len(self.other_user.institution_profiles),
            0, 'The other_user should have no profile')

    @patch('utils.verify_token', return_value={'email': 'otheruser@test.com'})
    def test_delete_user_not_admin(self, verify_token):
        """Test delete request with user is not admin."""
        with self.assertRaises(Exception) as ex:
            self.testapp.delete('/api/requests/' + self.request.key.urlsafe() + '/user')

        exception_message = self.get_message_exception(ex.exception.message)
        self.assertEqual(
            "Error! User is not admin",
            exception_message,
            "Expected error message is Error! User is not admin")


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
    # new Institution Address
    cls.address = Address()
    cls.address.number = '01'
    cls.address.street = 'street'
    # new Institution inst test
    cls.inst_test = Institution()
    cls.inst_test.name = 'inst test'
    cls.inst_test.address = cls.address
    cls.inst_test.members = [cls.user_admin.key]
    cls.inst_test.followers = [cls.user_admin.key]
    cls.inst_test.admin = cls.user_admin.key
    cls.inst_test.put()
    # institutions admin by user_admin
    cls.user_admin.institutions_admin = [cls.inst_test.key]
    cls.user_admin.put()
    # institution profile
    profile_data = {
        'office': "member",
        'institution_name': cls.inst_test.name,
        'institution_photo_url': "photo-url.com",
        'institution_key': cls.inst_test.key.urlsafe()
    }
    # update user profiles
    cls.other_user.create_and_add_profile(profile_data)
    # New request user
    data = {
        'sender_key': cls.other_user.key.urlsafe(),
        'is_request': True,
        'admin_key': cls.user_admin.key.urlsafe(),
        'institution_key': cls.inst_test.key.urlsafe(),
        'type_of_invite': 'REQUEST_USER'
    }

    cls.request = RequestUser.create(data)
    cls.request.put()
