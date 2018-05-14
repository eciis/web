# -*- coding: utf-8 -*-

from ..test_base import TestBase

from models.invite import Invite
from models import Institution
from models import InviteInstitution
from models import User

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

    def test_check_is_invite_institution_valid(self):
        """Test check_is_invite_institution_valid method."""
        with self.assertRaises(FieldException):
            data = {"suggestion_institution_name": None}
            InviteInstitution.check_is_invite_institution_valid(data)

    def test_create(self):
        """Test create method."""
        created_invite = InviteInstitution.create(self.data)
        stub_institution_key = created_invite.stub_institution_key

        expected_invite = InviteInstitution()
        expected_invite.admin_key = self.admin.key
        expected_invite.is_request = False
        expected_invite.institution_key = self.institution.key
        expected_invite.sender_key = self.admin.key
        expected_invite.sender_name = self.admin.name
        expected_invite.invitee = self.user.email[0]
        expected_invite.suggestion_institution_name = "new Institution"
        expected_invite.stub_institution_key = stub_institution_key

        self.assertEquals(
            created_invite,
            expected_invite,
            "The created invite should be equal to the expected one"
        )

    def test_make(self):
        """Test make method."""
        REQUIRED_PROPERTIES = ['name', 'address', 'description',
                               'key', 'photo_url', 'email', 'trusted',
                               'phone_number', 'institutional_email']

        invite_institution = InviteInstitution.create(self.data)
        invite_institution.put()
        stub_institution = invite_institution.stub_institution_key.get()

        maked_invite = invite_institution.make()

        expected_maked_invite = {
            'admin_name': self.admin.name,
            'sender_name': self.invite.sender_name,
            'key': invite_institution.key.urlsafe(),
            'status': self.invite.status,
            'institution_admin': self.institution.make(["name"]),
            'institution': self.institution.make(REQUIRED_PROPERTIES),
            'invitee': self.user.email[0],
            'suggestion_institution_name': 'new Institution',
            'stub_institution': stub_institution.make([
                'name', 'key', 'state'
            ]),
            'type_of_invite': 'INSTITUTION'
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

    # New invite
    cls.invite = Invite()
    cls.invite.invitee = cls.user.email[0]
    cls.invite.admin_key = cls.admin.key
    cls.invite.sender_key = cls.admin.key
    cls.invite.sender_name = cls.admin.name
    cls.invite.status = "sent"
    cls.invite.institution_key = cls.institution.key
    cls.invite.put()

    cls.data = {
        "admin_key": cls.admin.key.urlsafe(),
        "is_request": False,
        "institution_key": cls.institution.key.urlsafe(),
        "sender_key": cls.admin.key.urlsafe(),
        "sender_name": cls.admin.name,
        "invitee": cls.user.email[0],
        "suggestion_institution_name": "new Institution"
    }
