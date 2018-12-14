"""Feature Test."""

from .. import mocks
from ..test_base import TestBase
from models import Feature


class FeatureTest(TestBase):
    
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
        feature = Feature.create('feature-test')
        self.assertEqual(feature.name, 'feature-test')
        self.assertEqual(feature.enable_desktop, 'ALL')
        self.assertEqual(feature.enable_mobile, 'ALL')

        feature = Feature.create('feature-test2', 'DISABLED')
        self.assertEqual(feature.name, 'feature-test2')
        self.assertEqual(feature.enable_desktop, 'ALL')
        self.assertEqual(feature.enable_mobile, 'DISABLED')

        feature = Feature.create('feature-test3', 'DISABLED', 'DISABLED')
        self.assertEqual(feature.name, 'feature-test3')
        self.assertEqual(feature.enable_desktop, 'DISABLED')
        self.assertEqual(feature.enable_mobile, 'DISABLED')
