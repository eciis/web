# -*- coding: utf-8 -*-
"""Request Handler Test."""

import json
from test_base_handler import TestBaseHandler
from models import User
from models import Institution
from models import Address
from models.request_user import RequestUser
from handlers.request_handler import RequestHandler
import mocks

from mock import patch
import mock

ADMIN = {'email': 'user1@gmail.com'}
USER = {'email': 'otheruser@ccc.ufcg.edu.br'}


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

    @patch('utils.verify_token', return_value=ADMIN)
    def test_get(self, verify_token):
        """Test method get of RequestHandler."""
        admin = mocks.create_user(ADMIN['email'])
        institution = mocks.create_institution()		 
        admin.institutions_admin = [institution.key]
        institution.admin = admin.key
        admin.put()
        institution.put()
        otheruser = mocks.create_user(USER['email'])
        data = {
        'sender_key': otheruser.key.urlsafe(),
        'is_request': True,
        'admin_key': admin.key.urlsafe(),
        'institution_key': institution.key.urlsafe(),
        'type_of_invite': 'REQUEST_USER'
        }
        request = RequestUser.create(data)
        request.put()

        response = self.testapp.get('/api/requests/' + request.key.urlsafe() + '/user')
        request_response = json.loads(response._app_iter[0])

        self.assertEqual(
            request_response['sender'],
            request.sender_key.get().email,
            "expected sender email must be equal to sender email of original request")

        self.assertEqual(
            request_response['admin_name'],
            request.admin_key.get().name,
            "expected admin_name must be equal to admin_name of original request")

        self.assertEqual(
            request_response['institution_key'],
            request.institution_key.urlsafe(),
            "expected institution_key must be equal to institution_key of original request")

        self.assertEqual(
            request_response['type_of_invite'],
            'REQUEST_USER',
            "expected type_of_invite must be equal to  REQUEST_USER")

    @patch('utils.verify_token', return_value=ADMIN)
    def test_put(self, verify_token):
        """Test method put of RequestHandler."""
        admin = mocks.create_user(ADMIN['email'])
        institution = mocks.create_institution()		 
        institution.admin = admin.key
        institution.photo_url = 'tst.jpg'
        institution.put()
        admin.institutions_admin = [institution.key]
        admin.add_permission("answer_user_request", institution.key.urlsafe())
        admin.put()
        otheruser = mocks.create_user(USER['email'])
        
        data = {
        'sender_key': otheruser.key.urlsafe(),
        'is_request': True,
        'admin_key': admin.key.urlsafe(),
        'institution_key': institution.key.urlsafe(),
        'office': 'Dev',
        'type_of_invite': 'REQUEST_USER'
        }
        request = RequestUser.create(data)
        request.put()

        self.testapp.put('/api/requests/' + request.key.urlsafe() + '/user', headers={'Institution-Authorization': institution.key.urlsafe()})
        
        user = otheruser.key.get()
        institution = institution.key.get()

        self.assertEqual(
            request.key.get().status,
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

    @patch('utils.verify_token', return_value=ADMIN)
    def test_put_request_accepted(self, verify_token):
        """Test put request accepted."""
        admin = mocks.create_user(ADMIN['email'])
        institution = mocks.create_institution()		 
        institution.admin = admin.key
        institution.photo_url = 'tst.jpg'
        institution.put()
        admin.institutions_admin = [institution.key]
        admin.add_permission("answer_user_request", institution.key.urlsafe())
        admin.put()
        otheruser = mocks.create_user(USER['email'])
        data = {
        'sender_key': otheruser.key.urlsafe(),
        'is_request': True,
        'admin_key': admin.key.urlsafe(),
        'institution_key': institution.key.urlsafe(),
        'office': 'Dev',
        'type_of_invite': 'REQUEST_USER'
        }
        request = RequestUser.create(data)
        request.put()
        self.testapp.put('/api/requests/' + request.key.urlsafe() + '/user', headers={'Institution-Authorization': institution.key.urlsafe()})
        with self.assertRaises(Exception) as ex:
            self.testapp.put('/api/requests/' + request.key.urlsafe() + '/user')

        exception_message = self.get_message_exception(ex.exception.message)
        
        self.assertEqual(
            "Error! this request has already been processed",
            exception_message,
            "Expected error message is Error! this request has already been processed")

    @patch('utils.verify_token', return_value=USER)
    def test_put_user_not_admin(self, verify_token):
        """Test put request with user is not admin."""
        admin = mocks.create_user(ADMIN['email'])
        institution = mocks.create_institution()		 
        institution.admin = admin.key
        institution.put()
        admin.institutions_admin = [institution.key]
        admin.add_permission("answer_user_request", institution.key.urlsafe())
        admin.put()
        otheruser = mocks.create_user(USER['email'])
        data = {
        'sender_key': otheruser.key.urlsafe(),
        'is_request': True,
        'admin_key': admin.key.urlsafe(),
        'institution_key': institution.key.urlsafe(),
        'type_of_invite': 'REQUEST_USER'
        }
        request = RequestUser.create(data)
        request.put()
        with self.assertRaises(Exception) as ex:
            self.testapp.put('/api/requests/' + request.key.urlsafe() + '/user')

        exception_message = self.get_message_exception(ex.exception.message)
        self.assertEqual(
            "Error! User is not allowed to accept user request",
            exception_message,
            "Expected error message is Error! User is not allowed to accept user request")

    @patch('utils.verify_token', return_value=ADMIN)
    def test_delete(self, verify_token):
        """Test method delete of RequestHandler."""
        admin = mocks.create_user(ADMIN['email'])
        institution = mocks.create_institution()		 
        institution.admin = admin.key
        institution.put()
        admin.institutions_admin = [institution.key]
        admin.add_permission("answer_user_request", institution.key.urlsafe())
        admin.put()
        otheruser = mocks.create_user(USER['email'])
        profile_data = {
            'office': "member",
            'institution_name': institution.name,
            'institution_photo_url': "photo-url.com",
            'institution_key': institution.key.urlsafe()
        }
        otheruser.create_and_add_profile(profile_data)
        otheruser.put()
        data = {
        'sender_key': otheruser.key.urlsafe(),
        'is_request': True,
        'admin_key': admin.key.urlsafe(),
        'institution_key': institution.key.urlsafe(),
        'type_of_invite': 'REQUEST_USER'
        }
        request = RequestUser.create(data)
        request.put()
        self.assertEquals(
            len(otheruser.institution_profiles),
            1, 'The other_user should have only one profile')

        self.testapp.delete('/api/requests/' +
                            request.key.urlsafe() + '/user', headers={'Institution-Authorization': institution.key.urlsafe()})

        # update request and other_user
        self.request = request.key.get()
        self.other_user = otheruser.key.get()

        self.assertEqual(self.request.status, 'rejected')
        self.assertEquals(
            len(self.other_user.institution_profiles),
            0, 'The other_user should have no profile')

    @patch('utils.verify_token', return_value=USER)
    def test_delete_user_not_admin(self, verify_token):
        """Test delete request with user is not admin."""
        admin = mocks.create_user(ADMIN['email'])
        institution = mocks.create_institution()		 
        institution.admin = admin.key
        institution.put()
        admin.institutions_admin = [institution.key]
        admin.add_permission("answer_user_request", institution.key.urlsafe())
        admin.put()
        otheruser = mocks.create_user(USER['email'])
        data = {
        'sender_key': otheruser.key.urlsafe(),
        'is_request': True,
        'admin_key': admin.key.urlsafe(),
        'institution_key': institution.key.urlsafe(),
        'type_of_invite': 'REQUEST_USER'
        }
        request = RequestUser.create(data)
        request.put()

        with self.assertRaises(Exception) as ex:
            self.testapp.delete('/api/requests/' + request.key.urlsafe() + '/user')

        exception_message = self.get_message_exception(ex.exception.message)
        self.assertEqual(
            "Error! User is not allowed to reject user request",
            exception_message,
            "Expected error message is Error! User is not allowed to reject user request")