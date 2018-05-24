# -*- coding: utf-8 -*-
"""Tests of model request institution parent."""

from ..test_base import TestBase
from models import RequestInstitutionParent
from models import RequestInstitutionChildren
from models import RequestInstitution
from custom_exceptions import FieldException
from .. import mocks


class RequestInstitutionParentTest(TestBase):
    """Class request institution parent tests."""

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
        # new institution address
        cls.address = mocks.create_address()
        # new Institution inst test
        cls.inst_test = mocks.create_institution('inst test')
        cls.inst_test.members = [cls.user_admin.key]
        cls.inst_test.followers = [cls.user_admin.key]
        cls.inst_test.admin = cls.user_admin.key
        cls.inst_test.address = cls.address
        cls.inst_test.put()
        # new Institution inst requested to be parent of inst test
        cls.inst_requested = mocks.create_institution('inst requested')
        cls.inst_requested.members = [cls.user_admin.key]
        cls.inst_requested.followers = [cls.user_admin.key]
        cls.inst_requested.admin = cls.user_admin.key
        cls.inst_requested.address = cls.address
        cls.inst_requested.put()
        # Update institutions admin from User admin
        cls.user_admin.institutions_admin = [cls.inst_test.key]
        cls.user_admin.put()
        # Mocking deciis because some methods of request_institution require a deciis key
        cls.deciis = mocks.create_institution('DECIIS')
        cls.deciis.trusted = True
        cls.deciis.put()


    def test_is_valid(self):
        """Test if the request is valid."""
        data = {
            'sender_key': self.other_user.key.urlsafe(),
            'is_request': True,
            'admin_key': self.user_admin.key.urlsafe(),
            'institution_key': self.inst_test.key.urlsafe(),
            'institution_requested_key': self.inst_requested.key.urlsafe(),
            'type_of_invite': 'REQUEST_INSTITUTION'
        }

        request = RequestInstitution.create(data)

        self.assertTrue(request.isValid, 'Request should be valid')
