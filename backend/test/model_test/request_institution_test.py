# -*- coding: utf-8 -*-
"""Tests of model request institution."""

from ..test_base import TestBase
from models import RequestInstitution
from custom_exceptions import FieldException
from .. import mocks
from send_email_hierarchy.email_sender import EmailSender
from models import Invite
from mock import patch

def generate_request(sender, institution, requested_institution, admin=None):
    """create and save a request."""
    admin_key = admin.key.urlsafe() if admin else sender.key.urlsafe()
    data = {
        'sender_key': sender.key.urlsafe(),
        'is_request': True,
        'admin_key': admin_key,
        'institution_key': institution.key.urlsafe(),
        'institution_requested_key': requested_institution.key.urlsafe(),
        'type_of_invite': 'REQUEST_INSTITUTION'
    }

    request = RequestInstitution.create(data)
    request.put()
    return request

class RequestInstitutionTest(TestBase):
    """Class request institution tests."""

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        cls.test = cls.testbed.Testbed()
        cls.test.activate()
        cls.policy = cls.datastore.PseudoRandomHRConsistencyPolicy(
            probability=1)
        cls.test.init_datastore_v3_stub(consistency_policy=cls.policy)
        cls.test.init_memcache_stub()

        """Init the models."""
        # new User
        cls.user_admin = mocks.create_user('useradmin@test.com')
        # Other user
        cls.other_user = mocks.create_user('otheruser@test.com')
        # new Institution inst test
        cls.inst_test = mocks.create_institution('inst test')
        cls.inst_test.add_member(cls.other_user)
        cls.inst_test.set_admin(cls.other_user.key)
        cls.other_user.add_institution(cls.inst_test.key)
        cls.other_user.add_institution_admin(cls.inst_test.key)
        # Mocking deciis because some methods of request_institution require a deciis key
        cls.deciis = mocks.create_institution('DECIIS')
        cls.deciis.trusted = True
        cls.deciis.add_member(cls.user_admin)
        cls.deciis.set_admin(cls.user_admin.key)
        cls.user_admin.add_institution(cls.deciis.key)
        cls.user_admin.add_institution_admin(cls.deciis.key)

    def test_is_valid(self):
        """Test if the request is valid."""
        request = generate_request(
            self.other_user, self.inst_test,
            self.deciis, self.user_admin
        )

        self.assertTrue(request.isValid, 'Request should be valid')

    @patch.object(Invite, 'send_notification')
    @patch.object(Invite, 'create_notification_message', return_value='mocked_message')
    def test_send_notification(self, create_notification_message, send_notification):
        """Test send notification."""
        request = generate_request(
            self.other_user, self.inst_test,
            self.deciis, self.user_admin
        )

        request.send_notification(self.inst_test.key)

        create_notification_message.assert_called_with(
            user_key=self.other_user.key,
            receiver_institution_key=self.deciis.key
        )

        send_notification.assert_called_with(
            current_institution=self.inst_test.key,
            receiver_key=self.user_admin.key,
            notification_type='REQUEST_INSTITUTION',
            message='mocked_message'
        )

    @patch.object(EmailSender, 'send_email')
    def test_send_response_email(self, send_email):
        """Test send response email."""
        request = generate_request(
            self.other_user, self.inst_test,
            self.deciis, self.user_admin
        )

        email_json = {
            'institution_key': self.inst_test.key.urlsafe(),
            'user_name': self.other_user.name,
            'user_email': self.other_user.email[0],
            'description': self.inst_test.description,
            'institution_name': self.inst_test.name,
            'institution_requested_key': self.deciis.key.urlsafe()
        }

        for operation in ["ACCEPT", "REJECT"]:
            request.send_response_email(operation)
            send_email.assert_called_with(email_json)

    @patch.object(EmailSender, 'send_email')
    def test_send_email(self, send_email):
        """Test send email."""
        request = generate_request(
            self.other_user, self.inst_test,
            self.deciis, self.user_admin
        )

        email_json = {
            'user_name': self.other_user.name,
            'user_email': self.other_user.email[0],
            'description': self.inst_test.description,
            'institution_name': self.inst_test.name,
            'institution_key': self.inst_test.key.urlsafe(),
            'institution_requested_key': self.deciis.key.urlsafe()
        }

        request.send_email(host='somehost')
        send_email.assert_called_with(email_json)

    def test_make(self):
        """Test make."""
        request = generate_request(
            self.other_user, self.inst_test,
            self.deciis, self.user_admin
        )

        expected_json = {
            'status': 'sent',
            'institution_admin': {'name': self.inst_test.name },
            'sender': self.other_user.email,
            'sender_name': self.other_user.name,
            'sender_key': self.other_user.key.urlsafe(),
            'institution_name': self.inst_test.name,
            'requested_inst_name': self.deciis.name,
            'admin_name': self.user_admin.name,
            'key': request.key.urlsafe(),
            'institution': self.inst_test.make(RequestInstitution.INST_PROPS_TO_MAKE),
            'type_of_invite': 'REQUEST_INSTITUTION',
            'institution_key': self.inst_test.key.urlsafe(),
            'requested_institution': self.deciis.make(Invite.INST_PROPS_TO_MAKE)
        }

        made_request = request.make()

        self.assertEquals(made_request, expected_json,
            "The made request should be equal to the expected_json")