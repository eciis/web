# -*- coding: utf-8 -*-

from ..test_base import TestBase

from models import Institution
from .. import mocks
from models import InviteInstitutionChildren


class InviteInstitutionChildrenTest(TestBase):
    """Test InviteInstitutionChildrenTest model."""

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
        """Test create method."""
        user = mocks.create_user()
        parent_inst = mocks.create_institution()
        parent_inst.admin = user.key
        user.add_institution_admin(parent_inst.key)
        user.put()
        parent_inst.put()
        second_user = mocks.create_user()

        data = {
            'institution_key': parent_inst.key.urlsafe(),
            'admin_key': user.key.urlsafe(),
            'invitee': second_user.email[0],
            'suggestion_institution_name': 'test'
        }

        expected_invite = InviteInstitutionChildren()
        expected_invite.institution_key = parent_inst.key
        expected_invite.admin_key = user.key
        expected_invite.invitee = second_user.email[0]
        expected_invite.suggestion_institution_name = 'test'
        expected_invite.sender_key = user.key
        expected_invite.sender_name = user.name

        invite = InviteInstitutionChildren.create(data)

        self.assertEquals(expected_invite.institution_key,
                          invite.institution_key)
        self.assertEquals(expected_invite.admin_key, invite.admin_key)
        self.assertEquals(expected_invite.invitee, invite.invitee)
        self.assertEquals(expected_invite.suggestion_institution_name,
                          invite.suggestion_institution_name)
        self.assertEquals(expected_invite.sender_key, invite.sender_key)
        self.assertEquals(expected_invite.sender_name, invite.sender_name)
        self.assertTrue(invite.stub_institution_key != None)
        self.assertTrue(
            invite.stub_institution_key.get().parent_institution == parent_inst.key)

    def test_make(self):
        """Test make method."""
        user = mocks.create_user()
        parent_inst = mocks.create_institution()
        parent_inst.admin = user.key
        user.add_institution_admin(parent_inst.key)
        user.put()
        parent_inst.put()
        second_user = mocks.create_user()

        data = {
            'institution_key': parent_inst.key.urlsafe(),
            'admin_key': user.key.urlsafe(),
            'invitee': second_user.email[0],
            'suggestion_institution_name': 'test'
        }

        invite = InviteInstitutionChildren.create(data)
        invite.put()

        REQUIRED_PROPERTIES = ['name', 'address', 'description',
                               'key', 'photo_url', 'institutional_email',
                               'phone_number', 'email', 'trusted']
        institution = parent_inst.make(REQUIRED_PROPERTIES)
        expected_json = {
            'admin_name': invite.admin_key.get().name,
            'sender_name': invite.sender_name,
            'key': invite.key.urlsafe(),
            'institution_admin': parent_inst.make(['name']),
            'institution': institution,
            'invitee': invite.invitee,
            'suggestion_institution_name': invite.suggestion_institution_name,
            'stub_institution': Institution.make(invite.stub_institution_key.get(), ['name', 'key', 'state']),
            'type_of_invite': 'INSTITUTION_CHILDREN',
            'status': 'sent'
        }

        self.assertEquals(expected_json, invite.make())
