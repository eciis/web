# -*- coding: utf-8 -*-
"""Push Notification Service Test."""

from ..test_base import TestBase
from .. import mocks
from push_notification import get_notification_props, NotificationType
from custom_exceptions import EntityException


class PushNotificationServiceTest(TestBase):

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
        cls.inst = mocks.create_institution()
        cls.post = mocks.create_post(cls.f_user.key, cls.inst.key)
    

    def test_like_post_notification(self):
        url = "/posts/%s" %self.post.key.urlsafe()

        notification_props = get_notification_props(NotificationType('LIKE_POST'), self.post)

        self.assertEqual(notification_props['title'], 'Publicação curtida')
        self.assertEqual(
            notification_props['body'], 'Uma publicação de seu interesse foi curtida')
        self.assertEqual(notification_props['click_action'], url)
    
    def test_like_post_notification_without_entity(self):
        with self.assertRaises(EntityException) as ex:
            notification_props = get_notification_props(NotificationType('LIKE_POST'))
        
        error_message = ex.exception.message

        self.assertEqual(
            error_message, 'A LIKE_POST notification requires the entity.')
    
    def test_comment_notification(self):
        url = "/posts/%s" % self.post.key.urlsafe()

        notification_props = get_notification_props(NotificationType('COMMENT'), self.post)

        self.assertEqual(notification_props['title'], 'Publicação comentada')
        self.assertEqual(
            notification_props['body'], 'Uma publicação do seu interesse foi comentada')
        self.assertEqual(notification_props['click_action'], url)
    
    def test_comment_notification_without_entity(self):
        with self.assertRaises(EntityException) as ex:
            notification_props = get_notification_props(NotificationType('COMMENT'))

        error_message = ex.exception.message

        self.assertEqual(
            error_message, 'A COMMENT notification requires the entity.')
    
    def test_invite_user_notification(self):
        url = "/notifications"

        notification_props = get_notification_props(NotificationType('USER'))

        self.assertEqual(notification_props['title'], 'Novo convite')
        self.assertEqual(notification_props['body'], 
            'Você recebeu um novo convite para ser membro de uma instituição')
        self.assertEqual(notification_props['click_action'], url)
    
    def test_invite_user_adm_notification(self):
        url = "/notifications"

        notification_props = get_notification_props(NotificationType('USER_ADM'))

        self.assertEqual(notification_props['title'], 'Novo convite')
        self.assertEqual(notification_props['body'],
                         'Você recebeu um novo convite para ser administrador de uma instituição')
        self.assertEqual(notification_props['click_action'], url)
