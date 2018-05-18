# -*- coding: utf-8 -*-
"""Invite User Adm Test."""

from .. import mocks
from ..test_base import TestBase

from models import Institution
from models import InviteUserAdm
from models import User

from custom_exceptions.notAuthorizedException import NotAuthorizedException


class InviteUserAdmTest(TestBase):
    """Test invite user adm model."""

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        cls.test = cls.testbed.Testbed()
        cls.test.activate()
        cls.policy = cls.datastore.PseudoRandomHRConsistencyPolicy(
            probability=1)
        cls.test.init_datastore_v3_stub(consistency_policy=cls.policy)
        cls.test.init_memcache_stub()
    
    def test_create(self):
        """Test create new invite."""
        institution = mocks.create_institution()
        admin = mocks.create_user()
        new_admin = mocks.create_user()

        institution.add_member(admin)
        admin.institutions.append(institution.key)
        institution.set_admin(admin.key)
        institution.add_member(new_admin)
        admin.add_institution_admin(institution.key)

        institution.put()
        admin.put()

        data = {
            "invitee": new_admin.email[0],
            "institution_key": institution.key.urlsafe(),
            "admin_key": admin.key.urlsafe(),
            "is_request": False,
            "sender_key": admin.key.urlsafe(),
            "sender_name": admin.name,
            "invitee_key": new_admin.key.urlsafe()
        }

        created_invite = InviteUserAdm.create(data)
        
        expected_invite = InviteUserAdm()
        expected_invite.invitee = new_admin.email[0]
        expected_invite.admin_key = admin.key
        expected_invite.is_request = False
        expected_invite.institution_key = institution.key
        expected_invite.sender_key = admin.key
        expected_invite.sender_name = admin.name
        expected_invite.invitee_key = new_admin.key

        self.assertEquals(
            created_invite,
            expected_invite,
            "The created invite should be equal to the expected one"
        )
    
    def test_create_invite_with_invitee_not_a_member(self):
        """Test create invite whith invitee not a member."""
        institution = mocks.create_institution()
        admin = mocks.create_user()
        new_admin = mocks.create_user()

        institution.add_member(admin)
        admin.institutions.append(institution.key)
        institution.set_admin(admin.key)
        admin.add_institution_admin(institution.key)

        institution.put()
        admin.put()

        data = {
            "invitee": new_admin.email[0],
            "institution_key": institution.key.urlsafe(),
            "admin_key": admin.key.urlsafe(),
            "is_request": False,
            "sender_key": admin.key.urlsafe(),
            "sender_name": admin.name,
            "invitee_key": new_admin.key.urlsafe()
        }

        with self.assertRaises(NotAuthorizedException) as raises_context:
            InviteUserAdm.create(data)
        
        message_exeption = str(raises_context.exception)
        self.assertEqual(
            message_exeption, 
            'The invitee is not a member of this institution!',
            'Expected message of exception must be equal to The invitee is not a member of this institution!'
        )
    
    def test_create_more_than_one_invitation(self):
        """Test create more than one invitation."""
        institution = mocks.create_institution()
        admin = mocks.create_user()
        new_admin = mocks.create_user()

        institution.add_member(admin)
        admin.institutions.append(institution.key)
        institution.set_admin(admin.key)
        institution.add_member(new_admin)
        admin.add_institution_admin(institution.key)

        institution.put()
        admin.put()

        data = {
            "invitee": new_admin.email[0],
            "institution_key": institution.key.urlsafe(),
            "admin_key": admin.key.urlsafe(),
            "is_request": False,
            "sender_key": admin.key.urlsafe(),
            "sender_name": admin.name,
            "invitee_key": new_admin.key.urlsafe()
        }

        created_invite = InviteUserAdm.create(data)
        created_invite.put()

        with self.assertRaises(NotAuthorizedException) as raises_context:
            InviteUserAdm.create(data)
        
        message_exeption = str(raises_context.exception)
        self.assertEqual(
            message_exeption, 
            'An invitation is already being processed for this institution!',
            'Expected message of exception must be equal to An invitation is already being processed for this institution!'
        )
    
    def test_create_user_not_admin(self):
        """Test create with user not admin."""
        institution = mocks.create_institution()
        admin = mocks.create_user()
        new_admin = mocks.create_user()

        institution.add_member(admin)
        admin.institutions.append(institution.key)
        institution.set_admin(admin.key)
        institution.add_member(new_admin)
        admin.add_institution_admin(institution.key)

        institution.put()
        admin.put()

        data = {
            "invitee": new_admin.email[0],
            "institution_key": institution.key.urlsafe(),
            "admin_key": new_admin.key.urlsafe(),
            "is_request": False,
            "sender_key": new_admin.key.urlsafe(),
            "sender_name": new_admin.name,
            "invitee_key": new_admin.key.urlsafe()
        }

        with self.assertRaises(NotAuthorizedException) as raises_context:
            InviteUserAdm.create(data)
        
        message_exeption = str(raises_context.exception)
        self.assertEqual(
            message_exeption, 
            'Sender is not admin of this institution!',
            'Expected message of exception must be equal to Sender is not admin of this institution!'
        )
    
    def test_create_user_already_admin(self):
        """Test create with user already admin."""
        institution = mocks.create_institution()
        admin = mocks.create_user()

        institution.add_member(admin)
        admin.institutions.append(institution.key)
        institution.set_admin(admin.key)
        admin.add_institution_admin(institution.key)

        institution.put()
        admin.put()

        data = {
            "invitee": admin.email[0],
            "institution_key": institution.key.urlsafe(),
            "admin_key": admin.key.urlsafe(),
            "is_request": False,
            "sender_key": admin.key.urlsafe(),
            "sender_name": admin.name,
            "invitee_key": admin.key.urlsafe()
        }

        with self.assertRaises(NotAuthorizedException) as raises_context:
            InviteUserAdm.create(data)
        
        message_exeption = str(raises_context.exception)
        self.assertEqual(
            message_exeption, 
            'The invitee is already admin of this institution!',
            'Expected message of exception must be equal to The invitee is already admin of this institution!'
        )

    
    def test_make(self):
        """Test make invite."""
        institution = mocks.create_institution()
        admin = mocks.create_user()
        new_admin = mocks.create_user()

        institution.add_member(admin)
        admin.institutions.append(institution.key)
        institution.set_admin(admin.key)
        institution.add_member(new_admin)
        admin.add_institution_admin(institution.key)

        institution.put()
        admin.put()

        data = {
            "invitee": new_admin.email[0],
            "institution_key": institution.key.urlsafe(),
            "admin_key": admin.key.urlsafe(),
            "is_request": False,
            "sender_key": admin.key.urlsafe(),
            "sender_name": admin.name,
            "invitee_key": new_admin.key.urlsafe()
        }

        created_invite = InviteUserAdm.create(data)
        created_invite.put()

        REQUIRED_PROPERTIES = ['name', 'address', 'description',
                               'key', 'photo_url', 'email',
                               'phone_number', 'institutional_email', 'trusted']

        maked_invite = created_invite.make()

        expected_maked_invite = {
            "invitee": new_admin.email[0],
            "sender_name": admin.name,
            "admin_name": admin.name,
            "key": created_invite.key.urlsafe(),
            "status": created_invite.status,
            "institution_admin": {"name": institution.name},
            "institution": institution.make(REQUIRED_PROPERTIES),
            "institution_key": institution.key.urlsafe(),
            "invitee_key": new_admin.key.urlsafe(),
            "invitee_name": new_admin.name,
            "type_of_invite": "INVITE_USER_ADM"
        }

        self.assertEquals(
            maked_invite,
            expected_maked_invite,
            "The maked invite should be equal to the expected one"
        )
