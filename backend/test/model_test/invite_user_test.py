# -*- coding: utf-8 -*-

from ..test_base import TestBase

from models.institution import Institution
from models.invite_user import InviteUser
from models.user import User

from custom_exceptions.fieldException import FieldException


class InviteInstitutionTest(TestBase):
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
        initModels(cls)

    def test_inviteeIsMember(self):
        """Test inviteeIsMember method."""
        is_admin_member = InviteUser.inviteeIsMember(
            self.admin.email[0], self.institution
        )

        is_user_member = InviteUser.inviteeIsMember(
            self.user.email[0], self.institution
        )

        self.assertEquals(
            is_admin_member,
            True,
            "The admin should be a member of this institution"
        )

        self.assertEquals(
            is_user_member,
            False,
            "The user should not be a member of this institution"
        )

    def test_inviteeIsInvited(self):
        """Test inviteeIsInvited method."""
        is_user_invited = InviteUser.inviteeIsInvited(
            self.user.email[0], self.institution.key
        )

        is_user_not_invited = InviteUser.inviteeIsInvited(
            "not_invited@email", self.institution.key
        )

        self.assertEquals(
            is_user_invited,
            True,
            "The user should have been invited"
        )

        self.assertEquals(
            is_user_not_invited,
            False,
            "The user should not have invites"
        )

    def test_checkIsInviteUserValid(self):
        """Test checkIsInviteUserValid method."""
        # Test case in which the invitee has already been invited
        with self.assertRaises(FieldException):
            InviteUser.checkIsInviteUserValid(self.data)

        # Test case in which the invitee is already a member
        self.data["invitee"] = self.admin.email[0]
        with self.assertRaises(FieldException):
            InviteUser.checkIsInviteUserValid(self.data)

    def test_create(self):
        """Test create method."""
        self.data["invitee"] = "other_user@email"
        created_invite = InviteUser.create(self.data)

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
        REQUIRED_PROPERTIES = ['name', 'address', 'description',
                               'key', 'photo_url', 'email',
                               'phone_number']

        maked_invite = self.invite_user.make()

        expected_maked_invite = {
            "invitee": self.user.email[0],
            "sender_name": self.admin.name,
            "admin_name": self.admin.name,
            "key": self.invite_user.key.urlsafe(),
            "status": self.invite_user.status,
            "institution_admin": {"name": self.institution.name},
            "institution": self.institution.make(REQUIRED_PROPERTIES),
            "institution_key": self.institution.key.urlsafe(),
            "type_of_invite": "USER"
        }

        self.assertEquals(
            maked_invite,
            expected_maked_invite,
            "The maked invite should be equal to the expected one"
        )


def initModels(cls):
    """Initialize the models."""
    # admin
    cls.admin = User()
    cls.admin.name = "admin"
    cls.admin.email = ["admin@email"]
    cls.admin.put()

    # user
    cls.user = User()
    cls.user.name = "user"
    cls.user.email = ["user@email"]
    cls.user.put()

    # New institution
    cls.institution = Institution()
    cls.institution.name = "institution"
    cls.institution.admin = cls.admin.key
    cls.institution.members = [cls.admin.key]
    cls.institution.followers = [cls.admin.key]
    cls.institution.put()

    # update admin
    cls.admin.institutions_admin = [cls.institution.key]
    cls.admin.put()

    cls.invite_user = InviteUser()
    cls.invite_user.invitee = cls.user.email[0]
    cls.invite_user.institution_key = cls.institution.key
    cls.invite_user.admin_key = cls.admin.key
    cls.invite_user.sender_name = cls.admin.name
    cls.invite_user.status = 'sent'
    cls.invite_user.put()

    cls.data = {
        "invitee": cls.user.email[0],
        "institution_key": cls.institution.key.urlsafe(),
        "admin_key": cls.admin.key.urlsafe(),
        "is_request": False,
        "sender_key": cls.admin.key.urlsafe(),
        "sender_name": cls.admin.name
    }
