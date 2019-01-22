"""Feature toggle handler test"""

import json
from ..test_base_handler import TestBaseHandler
from handlers import FeatureToggleHandler
from models import Feature
from mock import patch
from .. import mocks


USER = {'email': 'user@email.com'}

class FeatureToggleHandlerTest(TestBaseHandler):
    """
    Feature Toggle Handler Test.
    """
    
    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(FeatureToggleHandlerTest, cls).setUp()
        app = cls.webapp2.WSGIApplication(
            [("/api/feature-toggles.*",
                FeatureToggleHandler)
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)

        cls.feature = Feature.create('feature-test', {'pt-br': 'Feature Teste'})
        cls.other_feature = Feature.create('feature-test-other', {'pt-br': 'Feature Teste'})
    

    @patch('util.login_service.verify_token', return_value=USER)
    def test_get_all(self, verify_token):
        """Test get all features."""

        features = self.testapp.get('/api/feature-toggles?lang=pt-br').json
        features_make = [self.feature.make(), self.other_feature.make()]

        self.assertEquals(len(features), 2)
        self.assertItemsEqual(features, features_make)
    
    @patch('util.login_service.verify_token', return_value=USER)
    def test_get_by_query(self, verify_token):
        """Test get feature with query parameter."""
        feature = self.testapp.get('/api/feature-toggles?name=feature-test&lang=pt-br').json
        feature_make = [self.feature.make()]

        self.assertListEqual(feature, feature_make)

        feature = self.testapp.get('/api/feature-toggles?name=feature-test-other&lang=pt-br').json
        feature_make = [self.other_feature.make()]

        self.assertListEqual(feature, feature_make)

        with self.assertRaises(Exception) as raises_context:
            self.testapp.get('/api/feature-toggles?name=sfjkldh')

        exception_message = self.get_message_exception(str(raises_context.exception))
        
        self.assertEquals(exception_message, "Error! Feature not found!")

    @patch('util.login_service.verify_token', return_value=USER)
    def test_put(self, verify_token):
        """Test put features."""

        user_admin = mocks.create_user('user@email.com')
        user = mocks.create_user()
        deciis = mocks.create_institution('DECIIS')
        deciis.trusted = True
        deciis.add_member(user_admin)
        deciis.set_admin(user_admin.key)
        user_admin.add_institution(deciis.key)
        user_admin.add_institution_admin(deciis.key)

        feature = self.feature.make()
        other_feature = self.other_feature.make()

        feature['enable_mobile'] = 'DISABLED'
        other_feature['enable_desktop'] = 'DISABLED'

        self.testapp.put_json('/api/feature-toggles', feature)
        self.testapp.put_json('/api/feature-toggles', other_feature)

        self.feature = self.feature.key.get()
        self.other_feature = self.other_feature.key.get()

        self.assertEquals(self.feature.enable_desktop, 'ALL')
        self.assertEquals(self.feature.enable_mobile, 'DISABLED')
        self.assertEquals(self.other_feature.enable_desktop, 'DISABLED')
        self.assertEquals(self.other_feature.enable_mobile, 'ALL')

        verify_token._mock_return_value = {'email': user.email[0]}

        with self.assertRaises(Exception) as raises_context:
            self.testapp.put_json('/api/feature-toggles', feature)

        exception_message = self.get_message_exception(str(raises_context.exception))
        
        self.assertEquals(exception_message, 'Error! User not allowed to modify features!')
