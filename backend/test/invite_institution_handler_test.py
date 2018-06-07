# -*- coding: utf-8 -*-
"""Invite Institution Handler Test."""

import json
import mocks

from test_base_handler import TestBaseHandler
from models import InviteInstitution
from models import Invite
from handlers import InviteInstitutionHandler
from mock import patch
from models import InviteUser

CURRENT_INSTITUTION = {'name': 'currentInstitution'}
CURRENT_INST_STRING = json.dumps(CURRENT_INSTITUTION)


class InviteInstitutionHandlerTest(TestBaseHandler):
    """Invite Institution Handler Test."""

    INVITE_INSTITUTION_URI = "/api/invites/institution/(.*)"

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(InviteInstitutionHandlerTest, cls).setUp()

        app = cls.webapp2.WSGIApplication(
            [(InviteInstitutionHandlerTest.INVITE_INSTITUTION_URI, InviteInstitutionHandler),
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)

        # create models
        # new User
        cls.user_admin = mocks.create_user('useradmin@test.com')
        # Other user
        cls.other_user = mocks.create_user('otheruser@test.com')
        # new Institution inst test
        cls.inst_test = mocks.create_institution()
        cls.inst_test.admin = cls.user_admin.key
        cls.inst_test.state = "active"
        cls.inst_test.put()
        # New invite user
        cls.data = {
            'invitee': 'otheruser@test.com',
            'admin_key': cls.user_admin.key.urlsafe(),
            'institution_key': cls.inst_test.key.urlsafe(),
            'suggestion_institution_name': 'test'
        }
        cls.invite = InviteInstitution.create(cls.data)
        cls.invite.put()

    @patch.object(Invite, 'send_notification')
    @patch('util.login_service.verify_token', return_value={'email': 'otheruser@test.com'})
    def test_delete(self, verify_token, send_notification):
        """Test method delete of InviteInstitutionHandler."""
        invite_institution = InviteInstitution.create(self.data)
        invite_institution.put()

        self.testapp.delete('/api/invites/institution/%s' %
                            invite_institution.key.urlsafe())

        invite_institution = invite_institution.key.get()
        self.assertTrue(invite_institution.status == "rejected")

        # assert the notification was sent
        send_notification.assert_called()

    @patch('util.login_service.verify_token', return_value={'email': 'otheruser@test.com'})
    def test_delete_with_a_rejected_invite(self, verify_token):
        """Test delete with a rejected invite."""
        self.invite.status = "rejected"
        self.invite.put()

        with self.assertRaises(Exception) as raises_context:
            self.testapp.delete(
                '/api/invites/institution/%s'
                % self.invite.key.urlsafe()
            )

        message_exception = self.get_message_exception(
            str(raises_context.exception))

        expected_message = "Error! This invitation has already been processed"

        self.assertEqual(
            message_exception,
            expected_message,
            "Expected exception message must be equal to %s" % expected_message
        )

    @patch('util.login_service.verify_token', return_value={'email': 'otheruser@test.com'})
    def test_delete_with_an_accepted_invite(self, verify_token):
        """Test delete with an accepted invite."""
        self.invite.status = "accepted"
        self.invite.put()

        with self.assertRaises(Exception) as raises_context:
            self.testapp.delete(
                '/api/invites/institution/%s'
                % self.invite.key.urlsafe()
            )

        message_exception = self.get_message_exception(
            str(raises_context.exception))

        expected_message = "Error! This invitation has already been processed"
        print message_exception
        self.assertEqual(
            message_exception,
            expected_message,
            "Expected exception message must be equal to %s" % expected_message
        )

    @patch('util.login_service.verify_token', return_value={'email': 'otheruser@test.com'})
    def test_delete_with_a_wrong_invite(self, verify_token):
        """Test delete with a wrong invite."""
        data = {
            'invitee': 'otheruser@test.com',
            'admin_key': self.user_admin.key.urlsafe(),
            'institution_key': self.inst_test.key.urlsafe(),
            'suggestion_institution_name': 'test',
            'type_of_invite': 'INSTITUTION'
        }
        self.invite = InviteUser.create(data)
        self.invite.put()

        with self.assertRaises(Exception) as raises_context:
            self.testapp.delete(
                '/api/invites/institution/%s'
                % self.invite.key.urlsafe()
            )

        message_exception = self.get_message_exception(
            str(raises_context.exception))

        expected_message = "Error! The invite's type is not the expected one"

        self.assertEqual(
            message_exception,
            expected_message,
            "Expected exception message must be equal to %s" % expected_message
        )
