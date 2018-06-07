# -*- coding: utf-8 -*-
"""Invite Handler Test."""

import json
import mocks

from test_base_handler import TestBaseHandler
from models import InviteUser
from models import Invite
from handlers import InviteHandler
from mock import patch

CURRENT_INSTITUTION = {'name': 'currentInstitution'}
CURRENT_INST_STRING = json.dumps(CURRENT_INSTITUTION)


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

    @patch('util.login_service.verify_token', return_value={'email': 'otheruser@test.com'})
    def test_get(self, verify_token):
        """Test method get of InviteHandler."""
        response = self.testapp.get('/api/invites/' +
                                    self.invite.key.urlsafe())
        invite = json.loads(response._app_iter[0])

        self.assertEqual(
            invite,
            self.invite.make(),
            "Expected invite should be equal to make")
