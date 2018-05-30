# -*- coding: utf-8 -*-
"""Invite User Collection handler test."""

import mocks
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
    def test_post_invite_user(self, verify_token):
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
        invite = self.testapp.post_json(
            '/api/invites/user', 
            invite_body, 
            headers={'institution-authorization': institution.key.urlsafe()}
        )

        invite = invite.json
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


    @patch('util.login_service.verify_token')
    def test_post_invite_user_adm(self, verify_token):
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
        invite = self.testapp.post_json(
            '/api/invites/user', 
            invite_body, 
            headers={'institution-authorization': institution.key.urlsafe()}
        )

        invite = invite.json
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
