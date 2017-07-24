# -*- coding: utf-8 -*-
"""Imports."""
from test_base import TestBase


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
