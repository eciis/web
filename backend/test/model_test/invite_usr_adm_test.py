# -*- coding: utf-8 -*-
"""Invite User Adm Test."""

from ..test_base import TestBase

from models.institution import Institution
from models.invite_user import InviteUser
from models.user import User

from custom_exceptions.fieldException import FieldException


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
        self.assertTrue(True)