# -*- coding: utf-8 -*-
"""Invite User Handler Test."""

import json
from .. import mocks

from ..test_base_handler import TestBaseHandler
from models import InviteUser
from models import Invite
from handlers.invite_user_handler import InviteUserHandler
from mock import patch
from models import InviteInstitution

CURRENT_INSTITUTION = {'name': 'currentInstitution'}
CURRENT_INST_STRING = json.dumps(CURRENT_INSTITUTION)

class InviteUserHandlerTest(TestBaseHandler):
    """Invite User Handler Test."""

    INVITE_USER_URI = "/api/invites/user/(.*)"

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(InviteUserHandlerTest, cls).setUp()

        methods = set(cls.webapp2.WSGIApplication.allowed_methods)
        methods.add('PATCH')
        cls.webapp2.WSGIApplication.allowed_methods = frozenset(methods)

        app = cls.webapp2.WSGIApplication(
            [(InviteUserHandlerTest.INVITE_USER_URI, InviteUserHandler),
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
            'type_of_invite': 'USER'
        }
        cls.invite = InviteUser.create(cls.data)
        cls.invite.put()

    @patch.object(Invite, 'send_notification')
    @patch('util.login_service.verify_token', return_value={'email': 'otheruser@test.com'})
    def test_delete(self, verify_token, send_notification):
        """Test method delete of InviteUserHandler."""
        invite_user = InviteUser.create(self.data)
        invite_user.put()

        self.testapp.delete('/api/invites/user/%s' %invite_user.key.urlsafe())

        invite_user = invite_user.key.get()
        self.assertTrue(invite_user.status == "rejected")

        # assert the notification was sent
        send_notification.assert_called()

    @patch.object(Invite, 'send_notification')
    @patch('util.login_service.verify_token', return_value={'email': 'otheruser@test.com'})
    def test_patch(self, verify_token, send_notification):
        """Test method patch of InviteUserHandler."""
        profile = '{"email": "otheruser@test.com", "office": "Developer", "institution_key": "%s"}' % self.inst_test.key.urlsafe()
        json_patch = '[{"op": "add", "path": "/institution_profiles/-", "value": ' + profile + '}]'
        self.testapp.patch(
            '/api/invites/user/%s'
            % self.invite.key.urlsafe(),
            json_patch
        )
    
        invite = self.invite.key.get()
        self.assertEqual(
            invite.status,
            'accepted',
            "Expected status should be equal to accepted")

        user = self.other_user.key.get()

        self.assertEqual(
            user.institutions[0],
            self.inst_test.key,
            "Expected institutions should be equal to inst_test")

        self.assertEqual(
            len(user.institution_profiles),
            1,
            "Expected len of institutions_profiles should be equal to 1")

        self.assertEqual(
            user.state,
            'active',
            "Expected state should be equal to active")

        message = {
            "from": {
                'name': self.other_user.name.encode('utf8'),
                'photo_url': self.other_user.photo_url,
                'institution_name': self.invite.institution_key.get().name
            },
            "to": {
                'institution_name': ''
            },
            "current_institution": {
                'name': None
            }
        }

        send_notification.assert_called_with(
            current_institution=None, # The first invite the user doesn't have current_institution 
            message=json.dumps(message),
            sender_key=self.other_user.key, 
            receiver_key=self.user_admin.key,
            notification_type="ACCEPT_INVITE_USER"
        )

    @patch.object(Invite, 'send_notification')
    @patch('util.login_service.verify_token', return_value={'email': 'otheruser@test.com'})
    def test_patch_fail(self, verify_token, send_notification):
        """Test patch fail in InviteUserHandler because the profile has not office."""
        profile = '{"email": "otheruser@test.com"}'
        json_patch = '[{"op": "add", "path": "/institution_profiles/-", "value": ' + profile + '}]'

        with self.assertRaises(Exception) as ex:
            self.testapp.patch(
                '/api/invites/user/%s'% self.invite.key.urlsafe(),
                json_patch
            )

        exception_message = self.get_message_exception(str(ex.exception))

        self.assertEqual(
            exception_message,
            'Error! The profile is invalid.',
            "Expected exception_message should be equal to 'Error! The profile is invalid.'")
        
        # assert the notification was not sent
        send_notification.assert_not_called()
    
    @patch('util.login_service.verify_token', return_value={'email': 'otheruser@test.com'})
    def test_patch_with_inst_inactive(self, verify_token):
        """Test a patch invite_user when the user is already a member."""
        self.inst_test.state = "inactive"
        self.inst_test.put()

        with self.assertRaises(Exception) as raises_context:
            self.testapp.patch(
                '/api/invites/user/%s'
                % self.invite.key.urlsafe()
            )

        message_exception = self.get_message_exception(
            str(raises_context.exception))
        
        expected_message = "Error! The institution is not active."

        self.assertEqual(
            message_exception,
            expected_message,
            "Expected exception message must be equal to %s" %expected_message
        )
    
    @patch('util.login_service.verify_token', return_value={'email': 'otheruser@test.com'})
    def test_patch_with_a_user_that_is_already_a_member(self, verify_token):
        """Test a patch invite_user when the user is already a member."""
        self.inst_test.add_member(self.other_user)
        self.other_user.add_institution(self.inst_test.key)

        with self.assertRaises(Exception) as raises_context:
            self.testapp.patch(
                '/api/invites/user/%s'
                % self.invite.key.urlsafe()
            )

        message_exception = self.get_message_exception(
            str(raises_context.exception))
        
        expected_message = "Error! The user is already a member"

        self.assertEqual(
            message_exception,
            expected_message,
            "Expected exception message must be equal to %s" %expected_message
        )

    @patch('util.login_service.verify_token', return_value={'email': 'otheruser@test.com'})
    def test_patch_with_an_accepted_invite(self, verify_token):
        """Test patch with an accepted invite."""
        self.invite.status = "accepted"
        self.invite.put()

        with self.assertRaises(Exception) as raises_context:
            self.testapp.patch(
                '/api/invites/user/%s'
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
    def test_patch_with_a_rejected_invite(self, verify_token):
        """Test patch with a rejected invite."""
        self.invite.status = "rejected"
        self.invite.put()

        with self.assertRaises(Exception) as raises_context:
            self.testapp.patch(
                '/api/invites/user/%s'
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
    def test_delete_with_a_rejected_invite(self, verify_token):
        """Test delete with a rejected invite."""
        self.invite.status = "rejected"
        self.invite.put()

        with self.assertRaises(Exception) as raises_context:
            self.testapp.delete(
                '/api/invites/user/%s'
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
                '/api/invites/user/%s'
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
    def test_delete_with_a_wrong_invite(self, verify_token):
        """Test delete with a wrong invite."""
        data = {
            'invitee': 'otheruser@test.com',
            'admin_key': self.user_admin.key.urlsafe(),
            'institution_key': self.inst_test.key.urlsafe(),
            'suggestion_institution_name': 'test',
            'type_of_invite': 'INSTITUTION'
        }
        self.invite = InviteInstitution.create(data)
        self.invite.put()

        with self.assertRaises(Exception) as raises_context:
            self.testapp.delete(
                '/api/invites/user/%s'
                % self.invite.key.urlsafe()
            )

        message_exception = self.get_message_exception(
            str(raises_context.exception))

        invite_class_name = self.invite.__class__.__name__
        expected_message = "Error! The invite's type is %s, but InviteUser is the expected one" % invite_class_name

        self.assertEqual(
            message_exception,
            expected_message,
            "Expected exception message must be equal to %s" % expected_message
        )
    
    @patch('util.login_service.verify_token', return_value={'email': 'otheruser@test.com'})
    def test_patch_with_a_wrong_invite(self, verify_token):
        """Test patch with a wrong invite."""
        data = {
            'invitee': 'otheruser@test.com',
            'admin_key': self.user_admin.key.urlsafe(),
            'institution_key': self.inst_test.key.urlsafe(),
            'suggestion_institution_name': 'test',
            'type_of_invite': 'INSTITUTION'
        }
        self.invite = InviteInstitution.create(data)
        self.invite.put()

        with self.assertRaises(Exception) as raises_context:
            self.testapp.patch(
                '/api/invites/user/%s'
                % self.invite.key.urlsafe()
            )

        message_exception = self.get_message_exception(
            str(raises_context.exception))

        invite_class_name = self.invite.__class__.__name__
        expected_message = "Error! The invite's type is %s, but InviteUser is the expected one" %invite_class_name

        self.assertEqual(
            message_exception,
            expected_message,
            "Expected exception message must be equal to %s" % expected_message
        )
