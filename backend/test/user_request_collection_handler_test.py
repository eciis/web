# -*- coding: utf-8 -*-
"""User request handler collection test."""
import json
import mocks

from test_base_handler import TestBaseHandler
from models import User
from models import Institution
from models import Address
from models.invite import Invite
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
        
        # create models
        # new User
        cls.user_admin = mocks.create_user('useradmin@test.com')
        # new institution
        cls.other_inst = mocks.create_institution()
        # Other user
        cls.other_user = mocks.create_user('other_user@test.com')
        cls.other_user.institutions = [cls.other_inst.key]
        cls.other_user.put()
        # new Institution inst test
        cls.inst_test = mocks.create_institution()
        cls.inst_test.name = 'inst test'
        cls.inst_test.photo_url = 'www.photo.com'
        cls.inst_test.members = [cls.user_admin.key]
        cls.inst_test.followers = [cls.user_admin.key]
        cls.inst_test.admin = cls.user_admin.key
        cls.user_admin.add_institution(cls.inst_test.key)
        cls.inst_test.put()
        # create header
        cls.headers = {"Institution-Authorization": cls.other_inst.key.urlsafe()}

    @patch.object(Invite, "send_invite")
    @patch('utils.verify_token', return_value={'email': 'other_user@test.com'})
    def test_post(self, verify_token, send_invite):
        """Test method post of UserRequestCollectionHandlerTest."""
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
        body = {"data": data}

        request = self.testapp.post_json(
            "/api/institutions/%s/requests/user" % self.inst_test.key.urlsafe(), 
            body, 
            headers=self.headers
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
            user_updated.name, 'user name updated',
            'Expected new user name is user name updated')
        
        # assert the notification was sent
        send_invite.assert_called_with('localhost:80', self.other_inst.key)

    @patch.object(Invite, "send_invite")
    @patch('utils.verify_token', return_value={'email': 'other_user@test.com'})
    def test_post_invalid_request_type(self, verify_token, send_invite):
        """Test if an exception is thrown by passing an invalid request."""
        data = {
            'sender_key': self.other_user.key.urlsafe(),
            'is_request': True,
            'admin_key': self.user_admin.key.urlsafe(),
            'institution_key': self.inst_test.key.urlsafe(),
            'type_of_invite': 'INVITE',
            'sender_name': self.other_user.name,
            'office': 'CEO',
            'institutional_email': 'other@ceo.com',
            'institution_name': self.inst_test.name,
            'institution_photo_url': self.inst_test.photo_url
        }
        body = {"data": data}

        with self.assertRaises(Exception) as ex:
            self.testapp.post_json(
                "/api/institutions/" + self.inst_test.key.urlsafe() +
                "/requests/user",
                body,
                headers=self.headers
            )

        exception_message = self.get_message_exception(ex.exception.message)
        self.assertEqual(
            'Error! The type must be REQUEST_USER',
            exception_message,
            "Expected error message is Error! The type must be REQUEST_USER")

        # assert the notification was not sent
        send_invite.assert_not_called()
