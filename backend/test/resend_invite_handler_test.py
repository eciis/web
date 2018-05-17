# -*- coding: utf-8 -*-
"""Resend Invite Handler Test."""

import json
from search_module.search_institution import SearchInstitution
from test_base_handler import TestBaseHandler
from models import User
from models import Institution
from models import Address
from models import InviteUser
from models import InviteInstitution
from handlers.resend_invite_handler import ResendInviteHandler
import mocks

import mock
from mock import patch


class ResendInviteHandlerTest(TestBaseHandler):
    """Resend Invite Handler Test."""

    INVITE_URI = "/api/invites/(.*)/resend"

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(ResendInviteHandlerTest, cls).setUp()
        app = cls.webapp2.WSGIApplication(
            [(ResendInviteHandlerTest.INVITE_URI, ResendInviteHandler),
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)

    @mock.patch('models.invite_user.InviteUser.send_email')
    @mock.patch('models.invite_user.InviteUser.send_notification')
    @patch('util.login_service.verify_token', return_value={'email': 'user@gmail.com'})
    def test_post(self, verify_token, mock_method, second_mock_method):
        """Test post."""
        user = mocks.create_user("user@gmail.com")
        institution = mocks.create_institution()
        invite = mocks.create_invite(user, institution.key, "USER")
        user.add_permission("invite_members", institution.key.urlsafe())
        user.put()
        # Call the post method
        body = {
            'currentInstitution': {
                'name': 'current_institution'
            }
        }
        self.testapp.post_json(
            "/api/invites/%s/resend" % invite.key.urlsafe(),
            body
        )
        self.assertTrue(mock_method.called)
        self.assertTrue(second_mock_method.called)
