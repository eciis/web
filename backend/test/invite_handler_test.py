# -*- coding: utf-8 -*-
"""Invite Handler Test."""

import json
from search_module.search_institution import SearchInstitution
from test_base_handler import TestBaseHandler
from models.user import User
from models.institution import Institution
from models.institution import Address
from models.invite_user import InviteUser
from models.invite_institution import InviteInstitution
from handlers.invite_handler import InviteHandler

import mock
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
        response = self.testapp.get('/api/invites/' +
                                    self.invite.key.urlsafe())
        invite = json.loads(response._app_iter[0])

        self.assertEqual(
            invite,
            self.invite.make(),
            "Expected invite should be equal to make")

    @patch('utils.verify_token', return_value={'email': 'otheruser@test.com'})
    @mock.patch('service_messages.send_message_notification')
    def test_delete(self, verify_token, mock_method):
        """Test method delete of InviteHandler."""
        stub_institution = self.invite_institution.stub_institution_key.get()
        search_institution = SearchInstitution()
        stub_inst_document = search_institution.getDocuments(
            stub_institution.name,
            'pending'
        )
        searched_inst = stub_inst_document[0]

        self.assertEqual(
            stub_institution.state,
            'pending', 'The stub institution state should be pending'
        )

        self.assertEqual(
            searched_inst.get('name'),
            stub_institution.name,
            "The searched institution should have \
            the same name as the stub institution"
        )

        self.assertEqual(
            searched_inst.get('state'),
            'pending', "The searched institution state should be pending"
        )

        self.testapp.delete('/api/invites/' +
                            self.invite_institution.key.urlsafe())

        # update invite_institution, stub_institution and stub_inst_document
        invite_institution = self.invite_institution.key.get()
        stub_institution = invite_institution.stub_institution_key.get()
        stub_inst_document = search_institution.getDocuments(
            stub_institution.name,
            'inactive'
        )
        searched_inst = stub_inst_document[0]

        self.assertEqual(
            invite_institution.status,
            'rejected',
            "Expected status should be equal to rejected")

        self.assertEqual(
            stub_institution.state,
            'inactive', 'The stub institution state should be inactive'
        )

        self.assertEqual(
            searched_inst.get('name'),
            stub_institution.name,
            "The searched institution should have \
            the same name as the stub institution"
        )

        self.assertEqual(
            searched_inst.get('state'),
            'inactive', "The searched institution state should be inactive"
        )

        self.assertTrue(mock_method.assert_called,
                        "Should call the send_message_notification")

    @patch('utils.verify_token', return_value={'email': 'otheruser@test.com'})
    @mock.patch('service_messages.send_message_notification')
    def test_patch(self, verify_token, mock_method):
        """Test method patch of InviteHandler."""
        profile = '{"email": "otheruser@test.com", "office": "Developer"}'
        json_patch = '[{"op": "add", "path": "/institution_profiles/-", "value": ' + profile + '}]'
        self.testapp.patch('/api/invites/' + self.invite.key.urlsafe(), json_patch)

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

        self.assertTrue(mock_method.assert_called,
                        "Should call the send_message_notification")

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
            "Expected exception_message should be equal to 'Error! The profile is invalid.'")


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

    # New invite institution
    data['suggestion_institution_name'] = 'new Institution'
    data['type_of_invite'] = 'INSTITUTION'

    cls.invite_institution = InviteInstitution.create(data)
    cls.invite_institution.put()
