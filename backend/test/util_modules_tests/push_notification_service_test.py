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
        cls.inst.admin = cls.f_user.key
        cls.inst.put()
        cls.post = mocks.create_post(cls.f_user.key, cls.inst.key)
        cls.event = mocks.create_event(cls.f_user, cls.inst)
    

    def test_like_post_notification(self):
        """Test if the properties for LIKE_POST
        notification are the expected."""
        url = "/posts/%s" %self.post.key.urlsafe()

        notification_props = get_notification_props(NotificationType('LIKE_POST'), self.post)

        self.assertEqual(notification_props['title'], 'Publicação curtida', 
            "The notification's title wasn't the expected one")
        self.assertEqual(
            notification_props['body_message'], 'Uma publicação de seu interesse foi curtida', 
            "The notification's body_message wasn't the expected one")
        self.assertEqual(notification_props['click_action'], url, 
            "The click_action's url wasn't the expected one")
    
    def test_like_post_notification_without_entity(self):
        """Test if a exception is raised when try to get
        the notification props without an entity for LIKE_POST
        notification."""
        with self.assertRaises(EntityException) as ex:
            notification_props = get_notification_props(NotificationType('LIKE_POST'))
        
        error_message = ex.exception.message

        self.assertEqual(
            error_message, 'A LIKE_POST notification requires the entity.',
            "The error_message wasn't the expected one")
    
    def test_comment_notification(self):
        """Test if the properties for COMMENT
        notification are the expected."""
        url = "/posts/%s" % self.post.key.urlsafe()

        notification_props = get_notification_props(NotificationType('COMMENT'), self.post)

        self.assertEqual(notification_props['title'], 'Publicação comentada',
            "The notification's title wasn't the expected one")
        self.assertEqual(
            notification_props['body_message'], 'Uma publicação do seu interesse foi comentada', 
            "The notification's body_message wasn't the expected one")
        self.assertEqual(notification_props['click_action'], url, 
            "The click_action wasn't the expected one")
    
    def test_comment_notification_without_entity(self):
        """Test if a exception is raised when try to get
        the notification props without an entity for LIKE_POST
        notification."""
        with self.assertRaises(EntityException) as ex:
            notification_props = get_notification_props(NotificationType('COMMENT'))

        error_message = ex.exception.message

        self.assertEqual(
            error_message, 'A COMMENT notification requires the entity.',
            "The error_message wasn't the expected one")
    
    def test_invite_user_notification(self):
        """Test if the properties for USER
        notification are the expected."""
        url = "/notifications"

        notification_props = get_notification_props(NotificationType('USER'))

        self.assertEqual(notification_props['title'], 'Novo convite',
            "The notification's title wasn't the expected one")
        self.assertEqual(notification_props['body_message'], 
            'Você recebeu um novo convite para ser membro de uma instituição',
            "The notification's body_message wasn't the expected one")
        self.assertEqual(notification_props['click_action'], url, 
            "The click_action wasn't the expected one")
    
    def test_invite_user_adm_notification(self):
        """Test if the properties for USER_ADM
        notification are the expected."""
        url = "/notifications"

        notification_props = get_notification_props(NotificationType('USER_ADM'))

        self.assertEqual(notification_props['title'], 'Novo convite',
            "The notification's title wasn't the expected one")
        self.assertEqual(notification_props['body_message'],
            'Você recebeu um novo convite para ser administrador de uma instituição',
            "The notification's body_message wasn't the expected one")
        self.assertEqual(notification_props['click_action'], url,
            "The click_action wasn't the expected one")
    
    def test_link_notification(self):
        """Test if the properties for LINK
        notification are the expected."""
        url = "/institution/%s/inviteInstitution" % self.inst.key.urlsafe()

        notification_props = get_notification_props(NotificationType('LINK'), self.inst)

        self.assertEqual(notification_props['title'], 'Solicitação de vínculo',
            "The notification's title wasn't the expected one")
        self.assertEqual(notification_props['body_message'],
            'Uma instituição que você administra recebeu uma nova solicitação de vínculo',
            "The notification's body_message wasn't the expected one")
        self.assertEqual(notification_props['click_action'], url,
            "The click_action wasn't the expected one")
    
    def test_delete_member_notification(self):
        """Test if the properties for DELETE_MEMBER
        notification are the expected."""
        url = '/institution/%s/home' %self.inst.key.urlsafe()

        notification_props = get_notification_props(NotificationType('DELETE_MEMBER'), self.inst)

        self.assertEqual(notification_props['title'], 'Remoção de vínculo',
            "The notification's title wasn't the expected one")
        self.assertEqual(notification_props['body_message'],
            'Você foi removido da instituição %s' %self.inst.name,
            "The notification's body_message wasn't the expected one")
        self.assertEqual(notification_props['click_action'], url,
            "The click_action wasn't the expected one")
    
    def test_remove_inst_link_notification(self):
        """Test if the properties for REMOVE_INSTITUTION_LINK
        notification are the expected."""
        url = '/institution/%s/inviteInstitution' %self.inst.key.urlsafe()

        notification_props = get_notification_props(NotificationType('REMOVE_INSTITUTION_LINK'), self.inst)

        self.assertEqual(notification_props['title'], 'Remoção de vínculo',
            "The notification's title wasn't the expected one")
        self.assertEqual(notification_props['body_message'],
            'A instituição %s teve um de seus vínculos removidos' %self.inst.name,
            "The notification's body_message wasn't the expected one")
        self.assertEqual(notification_props['click_action'], url,
            "The click_action wasn't the expected one")
    
    def test_create_post_notification(self):
        """Test if the properties for CREATE_POST
        notification are the expected."""
        url = '/posts/%s' %self.post.key.urlsafe()

        notification_props = get_notification_props(NotificationType('CREATE_POST'), self.post)

        self.assertEqual(notification_props['title'], 'Novo post criado',
            "The notification's title wasn't the expected one")
        self.assertEqual(notification_props['body_message'],
            '%s criou um novo post' %self.post.author.urlsafe(),
            "The notification's body_message wasn't the expected one")
        self.assertEqual(notification_props['click_action'], url,
            "The click_action wasn't the expected one")
    
    def test_delete_post_notification(self):
        """Test if the properties for DELETE_POST
        notification are the expected."""
        url = "/"

        notification_props = get_notification_props(NotificationType('DELETE_POST'), self.post)

        self.assertEqual(notification_props['title'], 'Post deletado',
            "The notification's title wasn't the expected one")
        self.assertEqual(notification_props['body_message'],
            '%s deletou seu post' %self.f_user.name,
            "The notification's body_message wasn't the expected one")
        self.assertEqual(notification_props['click_action'], url,
            "The click_action wasn't the expected one")
    
    def test_reply_comment_notification(self):
        """Test if the properties for REPLY_COMMENT
        notification are the expected."""
        url = '/posts/%s' %self.post.key.urlsafe()

        notification_props = get_notification_props(NotificationType('REPLY_COMMENT'), self.post)

        self.assertEqual(notification_props['title'], 'Novo comentário',
            "The notification's title wasn't the expected one")
        self.assertEqual(notification_props['body_message'],
            'Seu comentário tem uma nova resposta',
            "The notification's body_message wasn't the expected one")
        self.assertEqual(notification_props['click_action'], url,
            "The click_action wasn't the expected one")
    
    def test_deleted_user_notification(self):
        """Test if the properties for DELETED_USER
        notification are the expected."""
        url = "/"

        notification_props = get_notification_props(NotificationType('DELETED_USER'), self.f_user)

        self.assertEqual(notification_props['title'], 'Usuário inativo',
            "The notification's title wasn't the expected one")
        self.assertEqual(notification_props['body_message'],
            '%s não está mais ativo na plataforma' %self.f_user.name,
            "The notification's body_message wasn't the expected one")
        self.assertEqual(notification_props['click_action'], url,
            "The click_action wasn't the expected one")
    
    def test_left_institution_notification(self):
        """Test if the properties for LEFT_INSTITUTION
        notification are the expected."""
        url = "/"

        notification_props = get_notification_props(NotificationType('LEFT_INSTITUTION'), self.f_user)

        self.assertEqual(notification_props['title'], 'Remoção de vínculo de membro',
            "The notification's title wasn't the expected one")
        self.assertEqual(notification_props['body_message'],
            '%s removeu o vínculo com uma das instituições que você administra' %self.f_user.name,
            "The notification's body_message wasn't the expected one")
        self.assertEqual(notification_props['click_action'], url,
            "The click_action wasn't the expected one")
    
    def test_invite_notification(self):
        """Test if the properties for INVITE
        notification are the expected."""
        url = '%s/new_invite' %self.inst.key.urlsafe()

        notification_props = get_notification_props(NotificationType('INVITE'), self.inst)

        self.assertEqual(notification_props['title'], 'Novo convite',
            "The notification's title wasn't the expected one")
        self.assertEqual(notification_props['body_message'],
            'Você tem um novo convite',
            "The notification's body_message wasn't the expected one")
        self.assertEqual(notification_props['click_action'], url,
            "The click_action wasn't the expected one")
    
    def test_deleted_institution_notification(self):
        """Test if the properties for DELETED_INSTITUTION
        notification are the expected."""
        url = "/"

        notification_props = get_notification_props(NotificationType('DELETED_INSTITUTION'), self.inst)

        self.assertEqual(notification_props['title'], 'Instituição removida',
            "The notification's title wasn't the expected one")
        self.assertEqual(notification_props['body_message'],
            'A instituição %s foi removida' %self.inst.name,
            "The notification's body_message wasn't the expected one")
        self.assertEqual(notification_props['click_action'], url,
            "The click_action wasn't the expected one")
    
    def test_deleted_event_notification(self):
        """Test if the properties for DELETED_EVENT
        notification are the expected."""
        url = "/"

        notification_props = get_notification_props(NotificationType('DELETED_EVENT'), self.event)

        self.assertEqual(notification_props['title'], 'Evento removido',
            "The notification's title wasn't the expected one")
        self.assertEqual(notification_props['body_message'],
            'O evento %s foi removido' %self.event.title,
            "The notification's body_message wasn't the expected one")
        self.assertEqual(notification_props['click_action'], url,
            "The click_action wasn't the expected one")
    
    def test_updated_event_notification(self):
        """Test if the properties for UPDATED_EVENT
        notification are the expected."""
        url = '/event/%s/details' %self.event.key.urlsafe()

        notification_props = get_notification_props(NotificationType('UPDATED_EVENT'), self.event)

        self.assertEqual(notification_props['title'], 'Evento editado',
            "The notification's title wasn't the expected one")
        self.assertEqual(notification_props['body_message'],
            'O evento %s foi editado' %self.event.title,
            "The notification's body_message wasn't the expected one")
        self.assertEqual(notification_props['click_action'], url,
            "The click_action wasn't the expected one")
