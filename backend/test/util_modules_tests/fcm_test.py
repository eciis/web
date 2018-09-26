"""Fcm Module Test."""

from ..test_base import TestBase
from mock import patch
from .. import mocks
import fcm


class FcmTest(TestBase):

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        cls.test = cls.testbed.Testbed()
        cls.test.activate()
        cls.policy = cls.datastore.PseudoRandomHRConsistencyPolicy(
            probability=1)
        cls.test.init_datastore_v3_stub(consistency_policy=cls.policy)
        cls.test.init_memcache_stub()
        cls.f_user = mocks.create_user()
        cls.s_user = mocks.create_user()
        cls.firebase_random_key = 'asdkopqweoDPOK_aopskdo'
        cls.token = "apsokdSDOKAOKDP_OPSKDPOK"
        cls.f_user_key = cls.f_user.key.urlsafe()
        cls.s_user_key = cls.s_user.key.urlsafe()

        cls.firebase_object = {
            cls.f_user_key: {
                cls.firebase_random_key: {
                    'token': cls.token
                }
            },
            cls.s_user_key: {
                cls.firebase_random_key: {
                    'token': cls.token
                }
            }
        }
    
    def test_token_filter_test(self):
        token = fcm.token_filter(self.firebase_object, self.f_user_key)
        self.assertEqual(self.token, token, "The filtered token is not the expected one")
    
    @patch('fcm.get_tokens_from_firebase')
    def test_get_tokens(self, mocked_method):
        mocked_method.return_value = {}
        tokens = fcm.get_tokens([])
        self.assertTrue(tokens == [])

        mocked_method.return_value = self.firebase_object
        tokens = fcm.get_tokens([self.f_user_key])
        self.assertTrue(tokens == [self.token])

        self.firebase_object[self.s_user_key] = {
            self.firebase_random_key: {
                'token': 'test-token'
            }
        }

        tokens = fcm.get_tokens([self.f_user_key, self.s_user_key])
        self.assertEqual(tokens, [self.token, 'test-token'])
    
    @patch('fcm.get_tokens_from_firebase')
    def test_get_token(self, mocked_method):
        mocked_method.return_value = self.firebase_object
        token = fcm.get_token('aposdkaopd-OAPSKDOPDKAP')
        self.assertEqual(None, token)

        token = fcm.get_token(self.f_user_key)
        self.assertEqual(token, self.token)

    def tearDown(self):
        """Deactivate the test."""
        self.test.deactivate()
