# -*- coding: utf-8 -*-
"""Invite Handler Test."""

import json
from test_base_handler import TestBaseHandler
from models.user import User
from models.institution import Institution
from models.institution import Address
from models.invite_user import InviteUser
from handlers.invite_handler import InviteHandler

from mock import patch


class InviteHandlerTest(TestBaseHandler):
    """Invite Handler Test."""

    INVITE_URI = "/api/invites/(.*)"

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(InviteHandlerTest, cls).setUp()

        methods = set(cls.webapp2.WSGIApplication.allowed_methods)
        methods.add('PATCH')
        cls.webapp2.WSGIApplication.allowed_methods = frozenset(methods)

        app = cls.webapp2.WSGIApplication(
            [(InviteHandlerTest.INVITE_URI, InviteHandler),
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)
        initModels(cls)

    @patch('utils.verify_token', return_value={'email': 'otheruser@test.com'})
    def test_get(self, verify_token):
        """Test method get of InviteHandler."""
        response = self.testapp.get('/api/invites/' + self.invite.key.urlsafe())
        invite = json.loads(response._app_iter[0])

        self.assertEqual(
            invite,
            self.invite.make(),
            "Expected invite muste be equal to make")

    @patch('utils.verify_token', return_value={'email': 'otheruser@test.com'})
    def test_delete(self, verify_token):
        """Test method delete of InviteHandler."""
        self.testapp.delete('/api/invites/' + self.invite.key.urlsafe())
        invite = self.invite.key.get()
        self.assertEqual(
            invite.status,
            'rejected',
            "Expected status muste be equal to rejected")

    @patch('utils.verify_token', return_value={'email': 'otheruser@test.com'})
    def test_patch(self, verify_token):
        """Test method patch of InviteHandler."""
        profile = '{"email": "otheruser@test.com", "office": "Developer"}'
        json_patch = '[{"op": "add", "path": "/institution_profiles/-", "value": ' + profile + '}]'
        self.testapp.patch('/api/invites/' + self.invite.key.urlsafe(), json_patch)

        invite = self.invite.key.get()
        self.assertEqual(
            invite.status,
            'accepted',
            "Expected status muste be equal to accepted")

        user = self.other_user.key.get()

        self.assertEqual(
            user.institutions[0],
            self.inst_test.key,
            "Expected institutions muste be equal to inst_test")

        self.assertEqual(
            len(user.institution_profiles),
            1,
            "Expected len of institutions_profiles muste be equal to 1")

        self.assertEqual(
            user.state,
            'active',
            "Expected state muste be equal to active")

    @patch('utils.verify_token', return_value={'email': 'otheruser@test.com'})
    def test_patch_fail(self, verify_token):
        """Test patch fail in InviteHandler because the profile has not office."""
        profile = '{"email": "otheruser@test.com"}'
        json_patch = '[{"op": "add", "path": "/institution_profiles/-", "value": ' + profile + '}]'

        with self.assertRaises(Exception) as ex:
            self.testapp.patch('/api/invites/' + self.invite.key.urlsafe(), json_patch)

        exception_message = self.get_message_exception(str(ex.exception))

        self.assertEqual(
            exception_message,
            'Error! The profile is invalid.',
            "Expected exception_message muste be equal to 'Error! The profile is invalid.'")


def initModels(cls):
    """Init the models."""
    # new User
    cls.user_admin = User()
    cls.user_admin.name = 'User Admin'
    cls.user_admin.email = 'useradmin@test.com'
    cls.user_admin.put()
    # Other user
    cls.other_user = User()
    cls.other_user.name = 'Other User'
    cls.other_user.email = 'otheruser@test.com'
    cls.other_user.put()
    # isntitution address
    cls.address = Address()
    # new Institution inst test
    cls.inst_test = Institution()
    cls.inst_test.name = 'inst test'
    cls.inst_test.address = cls.address
    cls.inst_test.members = [cls.user_admin.key]
    cls.inst_test.followers = [cls.user_admin.key]
    cls.inst_test.admin = cls.user_admin.key
    cls.inst_test.put()

    # New invite user
    data = {
        'invitee': 'otheruser@test.com',
        'admin_key': cls.user_admin.key.urlsafe(),
        'institution_key': cls.inst_test.key.urlsafe(),
        'type_of_invite': 'USER'
    }

    cls.invite = InviteUser.create(data)
    cls.invite.put()
