# -*- coding: utf-8 -*-

from ..test_base import TestBase

from models import Institution, InviteUser, User, Invite
from service_messages import create_message
from util import NotificationsQueueManager
from custom_exceptions import FieldException
from .. import mocks
from mock import patch

class InviteUserTest(TestBase):
    """Test invite model."""

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        cls.test = cls.testbed.Testbed()
        cls.test.activate()
        cls.policy = cls.datastore.PseudoRandomHRConsistencyPolicy(
            probability=1)
        cls.test.init_datastore_v3_stub(consistency_policy=cls.policy)
        cls.test.init_memcache_stub()
        
        """Init models"""
        cls.admin = mocks.create_user()
        cls.user = mocks.create_user()

        cls.institution = mocks.create_institution()
        cls.institution.add_member(cls.admin)
        cls.institution.set_admin(cls.admin.key)

        # update admin
        cls.admin.add_institution(cls.institution.key)
        cls.admin.add_institution_admin(cls.institution.key)

        cls.invite_user = InviteUser()
        cls.invite_user.invitee = cls.user.email[0]
        cls.invite_user.institution_key = cls.institution.key
        cls.invite_user.admin_key = cls.admin.key
        cls.invite_user.sender_name = cls.admin.name
        cls.invite_user.status = 'sent'
        cls.invite_user.put()


    def test_create(self):
        """Test create method."""
        data = {
            "invitee": "other_user@email",
            "institution_key": self.institution.key.urlsafe(),
            "admin_key": self.admin.key.urlsafe(),
            "is_request": False,
            "sender_key": self.admin.key.urlsafe(),
            "sender_name": self.admin.name
        }
        created_invite = InviteUser.create(data)

        expected_invite = InviteUser()
        expected_invite.invitee = "other_user@email"
        expected_invite.admin_key = self.admin.key
        expected_invite.is_request = False
        expected_invite.institution_key = self.institution.key
        expected_invite.sender_key = self.admin.key
        expected_invite.sender_name = self.admin.name

        self.assertEquals(
            created_invite,
            expected_invite,
            "The created invite should be equal to the expected one"
        )

    def test_make(self):
        """Test make method."""
        maked_invite = self.invite_user.make()

        expected_maked_invite = {
            "invitee": self.user.email[0],
            "sender_name": self.admin.name,
            "admin_name": self.admin.name,
            "key": self.invite_user.key.urlsafe(),
            "status": self.invite_user.status,
            "institution_admin": {"name": self.institution.name},
            "institution": self.institution.make(InviteUser.INST_PROPS_TO_MAKE),
            "institution_key": self.institution.key.urlsafe(),
            "type_of_invite": "USER"
        }

        self.assertEquals(
            maked_invite,
            expected_maked_invite,
            "The maked invite should be equal to the expected one"
        )

    @patch.object(NotificationsQueueManager, 'create_notification_task')
    @patch.object(InviteUser, 'create_notification_message')
    def test_create_sent_invites_notification(self, create_notification_message, create_notification_task):
        """Test method create_sent_invites_notification."""
        
        message = create_message(self.admin.key, self.institution.key)
        create_notification_message.return_value = message

        self.invite_user.create_sent_invites_notification(
            self.institution.key
        )

        create_notification_message.assert_called_with(
            user_key=self.admin.key,
            current_institution_key=self.institution.key            
        )

        create_notification_task.assert_called()
