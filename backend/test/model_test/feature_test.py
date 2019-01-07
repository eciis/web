"""Feature Test."""

from ..test_base import TestBase
from models import Feature


class FeatureTest(TestBase):
    """Feature model test."""
    
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
        """Teste create a new feature."""
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

        with self.assertRaises(Exception) as raises_context:
            Feature.create('feature-test', 'asjdkhd')
        
        exception_message = raises_context.exception
        self.assertEquals(
            str(exception_message), 
            "Value 'asjdkhd' for property enable_mobile is not an allowed choice"
        )

    def test_set_visibility(self):
        """Test set visibility."""
        Feature.create('feature-test')
        
        feature_dict = {
            'name': 'feature-test',
            'enable_mobile': 'DISABLED',
            'enable_desktop': 'ADMIN'
        }

        Feature.set_visibility([feature_dict])

        feature = Feature.get_feature('feature-test')

        self.assertEqual(feature.enable_mobile, 'DISABLED')
        self.assertEqual(feature.enable_desktop, 'ADMIN')

    def test_get_all_features(self):
        """Test get all features."""
        feature = Feature.create('feature-test')
        feature2 = Feature.create('feature-test2')

        features = Feature.get_all_features()
        self.assertIn(feature, features)
        self.assertIn(feature2, features)

        feature3 = Feature.create('feature-test3')
        self.assertNotIn(feature3, features)

        features = Feature.get_all_features()
        self.assertIn(feature3, features)
    
    def test_get_feature(self):
        """Test get feature."""
        feature = Feature.create('feature-test')
        feature2 = Feature.create('feature-test2')

        self.assertEqual(feature, Feature.get_feature('feature-test'))
        self.assertEqual(feature2, Feature.get_feature('feature-test2'))

        with self.assertRaises(Exception) as raises_context:
            Feature.get_feature('djsasadj')
        
        exception_message = raises_context.exception
        self.assertEquals(
            str(exception_message), 
            "Feature not found!"
        )

    def test_make(self):
        """Test make feature."""
        feature = Feature.create('feature-test')
        make = {
            'name': 'feature-test',
            'enable_mobile': 'ALL',
            'enable_desktop': 'ALL'
        }

        self.assertEqual(make, feature.make())
