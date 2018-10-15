# -*- coding: utf-8 -*-
"""Imports."""
from test_base import TestBase
import permissions

class TestBaseHandler(TestBase):
    """SuperClass of the handler's tests."""

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        cls.test = cls.testbed.Testbed()
        cls.test.activate()
        cls.policy = cls.datastore.PseudoRandomHRConsistencyPolicy(
            probability=1)
        cls.test.init_datastore_v3_stub(consistency_policy=cls.policy)
        cls.test.init_memcache_stub()
        cls.ndb.get_context().set_cache_policy(False)
        cls.test.init_search_stub()
    
    def get_message_exception(self, exception):
        """Return only message of string exception for tests."""
        self.list_args = exception.split("\n")
        self.dict = eval(self.list_args[1])
        return self.dict["msg"]
    

def has_permissions(user, institution_key, type_permission):
    for permission in type_permission:
        if not user.has_permission(permission, institution_key):
            return False
    return True
