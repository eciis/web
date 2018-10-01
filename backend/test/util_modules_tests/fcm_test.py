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
        cls.f_user_key = cls.f_user.key.urlsafe()
        cls.s_user_key = cls.s_user.key.urlsafe()
    
    @patch('fcm.send_push_notifications')
    @patch('fcm.get_single_user_tokens')
    def test_notify_single_user(self, get_token, send_notification):
        title = 'test'
        body = 'test'
        fcm.notify_single_user(title, body, self.f_user_key)
        
        get_token.assert_called()
        send_notification.assert_called()
    
    @patch('fcm.send_push_notifications')
    @patch('fcm.get_multiple_user_tokens')
    def test_notify_multiple_users(self, get_tokens, send_notification):
        title = 'test'
        body = 'test'
        fcm.notify_multiple_users(title, body, [self.f_user_key, self.s_user_key])

        get_tokens.assert_called()
        send_notification.assert_called()
    
    @patch('fcm.filter_single_user_tokens')
    @patch('fcm.get_tokens_from_firebase')
    def test_get_single_user_tokens(self, get_tokens, filter):
        fcm.get_single_user_tokens(self.f_user_key)
        
        get_tokens.assert_called()
        filter.assert_called()
    
    @patch('fcm.filter_multiple_user_tokens')
    @patch('fcm.get_all_tokens_from_firebase')
    def test_get_multiple_user_tokens(self, get_tokens, filter):
        fcm.get_multiple_user_tokens([self.f_user_key, self.s_user_key])

        get_tokens.assert_called()
        filter.assert_called()

    def test_filter_single_user_tokens(self):
        content = {
            'sapok-DOP': {
                'token': 'token-1'
            },
            'oakdopak-qopekqp': {
                'token': 'token-2'
            },
            'opkdsfa-OFDO': {
                'token': 'token-3'
            }
        }

        tokens = fcm.filter_single_user_tokens(content)
        self.assertTrue(len(tokens) == 3)
        self.assertTrue(
            'token-1' in tokens and 
            'token-2' in tokens and 
            'token-3' in tokens
        )
    
    def test_filter_multiple_user_tokens(self):
        content = {
            self.f_user_key: {
                'sapok-DOP': {
                    'token': 'token-1'
                }
            },
            self.s_user_key: {
                'oakdopak-qopekqp': {
                    'token': 'token-2'
                }
            }
        }

        users_keys = [self.f_user_key, self.s_user_key, 'aop-OPAKSD']

        tokens = fcm.filter_multiple_user_tokens(content, users_keys)
        self.assertTrue(len(tokens) == 2)
        self.assertTrue(
            'token-1' in tokens and
            'token-2' in tokens
        )

    def tearDown(self):
        """Deactivate the test."""
        self.test.deactivate()
