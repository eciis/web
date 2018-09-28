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
    
    @patch('fcm.send_push_notifications')
    @patch('fcm.get_single_user_tokens')
    def test_notify_single_user(self, get_token, send_notification):
        pass


    def tearDown(self):
        """Deactivate the test."""
        self.test.deactivate()
