# -*- coding: utf-8 -*-
"""Invite User Collection handler test."""

import mocks
import json
from permissions import DEFAULT_ADMIN_PERMISSIONS
from test_base_handler import TestBaseHandler
from google.appengine.ext import ndb
from handlers import InviteUserCollectionHandler
from mock import patch


def create_body(invitee_emails, admin, institution, type_of_invite):
    """Create a body for the post method."""
    body = {
        'data': {
            'invite_body': {
                'admin_key': admin.key.urlsafe(),
                'institution_key': institution.key.urlsafe()
            }
        }
    }

    if type_of_invite == 'USER_ADM':
        body['data']['invite_body']['invitee'] = invitee_emails[0]
        body['data']['invite_body']['type_of_invite'] = type_of_invite
    else:
        body['data']['emails'] = invitee_emails
        body['data']['invite_body']['type_of_invite'] = type_of_invite
    
    return body

class InviteUserCollectionHandlerTest(TestBaseHandler):

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(InviteUserCollectionHandlerTest, cls).setUp()
        app = cls.webapp2.WSGIApplication(
            [("/api/invites/user", InviteUserCollectionHandler)], debug=True)
        cls.testapp = cls.webtest.TestApp(app)
    
    @patch('util.login_service.verify_token')
    @patch('handlers.invite_user_collection_handler.enqueue_task')
    def test_post_invite_user(self, enqueue_task, verify_token):
        """."""

        admin = mocks.create_user()
        other_user = mocks.create_user()
        institution = mocks.create_institution()

        institution.add_member(admin)
        institution.set_admin(admin.key)

        admin.add_permissions(DEFAULT_ADMIN_PERMISSIONS, institution.key.urlsafe())
        admin.put()
        institution.put()

        invite_body = create_body([other_user.email[0]], admin, institution, 'USER')

        verify_token._mock_return_value = {'email': admin.email[0]}
        response = self.testapp.post_json(
            '/api/invites/user', 
            invite_body, 
            headers={'institution-authorization': institution.key.urlsafe()}
        )

        invite = response.json
        invite = ndb.Key(urlsafe=invite['invites'][0]['key']).get()

        REQUIRED_PROPERTIES = ['name', 'address', 'description',
                               'key', 'photo_url', 'institutional_email',
                               'phone_number', 'email', 'trusted']

        expected_make = {
            'invitee': other_user.email[0],
            'institution_key': institution.key.urlsafe(),
            'type_of_invite': "USER",
            'admin_name': admin.name,
            'sender_name': admin.name,
            'key': invite.key.urlsafe(),
            'status': 'sent',
            'institution_admin': institution.make(['name']),
            'institution': institution.make(REQUIRED_PROPERTIES)
        }

        self.assertEqual(expected_make, invite.make())

        enqueue_task.assert_called_with(
            'send-invite',
            {
                'invites_keys': json.dumps([invite.key.urlsafe()]), 
                'host': response.request.host,
                'current_institution': institution.key.urlsafe()
            }
        )


    @patch('util.login_service.verify_token')
    @patch('handlers.invite_user_collection_handler.enqueue_task')
    def test_post_invite_user_adm(self, enqueue_task, verify_token):
        """."""

        admin = mocks.create_user()
        other_user = mocks.create_user()
        institution = mocks.create_institution()

        institution.add_member(admin)
        institution.add_member(other_user)
        institution.set_admin(admin.key)

        admin.add_institution_admin(institution.key)
        admin.add_permissions(DEFAULT_ADMIN_PERMISSIONS, institution.key.urlsafe())
        admin.put()
        institution.put()

        invite_body = create_body([other_user.email[0]], admin, institution, 'USER_ADM')
        invite_body['data']['invite_body']['invitee_key'] = other_user.key.urlsafe()

        verify_token._mock_return_value = {'email': admin.email[0]}
        response = self.testapp.post_json(
            '/api/invites/user', 
            invite_body, 
            headers={'institution-authorization': institution.key.urlsafe()}
        )

        invite = response.json
        invite = ndb.Key(urlsafe=invite['invites'][0]['key']).get()

        REQUIRED_PROPERTIES = ['name', 'address', 'description',
                               'key', 'photo_url', 'institutional_email',
                               'phone_number', 'email', 'trusted']

        expected_make = {
            'invitee': other_user.email[0],
            'invitee_key': other_user.key.urlsafe(),
            'invitee_name': other_user.name,
            'institution_key': institution.key.urlsafe(),
            'type_of_invite': "INVITE_USER_ADM",
            'admin_name': admin.name,
            'sender_name': admin.name,
            'key': invite.key.urlsafe(),
            'status': 'sent',
            'institution_admin': institution.make(['name']),
            'institution': institution.make(REQUIRED_PROPERTIES)
        }

        self.assertEqual(expected_make, invite.make())

        enqueue_task.assert_called_with(
            'send-invite',
            {
                'invites_keys': json.dumps([invite.key.urlsafe()]), 
                'host': response.request.host,
                'current_institution': institution.key.urlsafe()
            }
        )

    @patch('util.login_service.verify_token')
    def test_post_invalid_invite_type(self, verify_token):
        """."""
        admin = mocks.create_user()
        other_user = mocks.create_user()
        institution = mocks.create_institution()

        institution.add_member(admin)
        institution.set_admin(admin.key)

        admin.add_permissions(DEFAULT_ADMIN_PERMISSIONS, institution.key.urlsafe())
        admin.put()
        institution.put()

        invite_body = create_body([other_user.email[0]], admin, institution, 'USER')
        invite_body['data']['invite_body']['type_of_invite'] = 'INSTITUION_CHILDREN'

        verify_token._mock_return_value = {'email': admin.email[0]}
        with self.assertRaises(Exception) as raises_context:
            self.testapp.post_json(
                '/api/invites/user', 
                invite_body, 
                headers={'institution-authorization': institution.key.urlsafe()}
            )

        message = self.get_message_exception(str(raises_context.exception))

        self.assertEqual(
            message,
            'Error! invitation type not allowed',
            "Expected error message is Error! invitation type not allowed"
        )

    @patch('util.login_service.verify_token')
    def test_post_invite_user_not_admin(self, verify_token):
        """."""
        admin = mocks.create_user()
        other_user = mocks.create_user()
        institution = mocks.create_institution()

        institution.add_member(admin)
        institution.set_admin(admin.key)

        admin.put()
        institution.put()

        invite_body = create_body([other_user.email[0]], admin, institution, 'USER')

        verify_token._mock_return_value = {'email': admin.email[0]}
        with self.assertRaises(Exception) as raises_context:
            self.testapp.post_json(
                '/api/invites/user', 
                invite_body, 
                headers={'institution-authorization': institution.key.urlsafe()}
            )

        message = self.get_message_exception(str(raises_context.exception))

        self.assertEqual(
            message,
            'Error! User is not allowed to send invites',
            "Expected error message is Error! User is not allowed to send invites"
        )
