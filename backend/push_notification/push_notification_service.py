# -*- coding: utf-8 -*-
"""Push Notification Service."""
from custom_exceptions import EntityException
from enum import Enum

__all__ = ['get_notification_props', 'NotificationType']

def get_notification_props(_type, entity=None):
    notification = NotificationProperties(_type, entity)
    return notification.get_props()

class NotificationType(Enum):
    like = 'LIKE_POST'
    comment = 'COMMENT'
    invite_user = 'USER'
    invite_user_adm = 'USER_ADM'
    link = 'LINK'

class NotificationProperties(object):

    def __init__(self, _type, entity):
        types = {
            NotificationType.like: self.__get_like_props,
            NotificationType.comment: self.__get_comment_props,
            NotificationType.invite_user: self.__get_invite_user_props,
            NotificationType.invite_user_adm: self.__get_invite_user_adm_props,
            NotificationType.link: self.__get_link_props
        }
        self.entity = entity
        self.notification_method = types[_type] 
        
    def get_props(self):
        return self.notification_method()
 
    def __get_like_props(self):
        if not self.entity:
            raise EntityException(
                'A LIKE_POST notification requires the entity.')

        url = '/posts/%s' % self.entity.key.urlsafe()

        return {
            'title': 'Publicação curtida',
            'body': 'Uma publicação de seu interesse foi curtida',
            'click_action': url
        }

    def __get_comment_props(self):
        if not self.entity:
            raise EntityException(
                'A COMMENT notification requires the entity.')
        url = "/posts/%s" % self.entity.key.urlsafe()

        return {
            'title': 'Publicação comentada',
            'body': 'Uma publicação do seu interesse foi comentada',
            'click_action': url
        }

    def __get_invite_user_props(self):
        url = "/notifications"

        return {
            'title': 'Novo convite',
            'body': 'Você recebeu um novo convite para ser membro de uma instituição',
            'click_action': url
        }

    def __get_invite_user_adm_props(self):
        url = "/notifications"

        return {
            'title': 'Novo convite',
            'body': 'Você recebeu um novo convite para ser administrador de uma instituição',
            'click_action': url
        }

    def __get_link_props(self):
        url = "/institution/%s/inviteInstitution" % self.entity.key.urlsafe()

        return {
            'title': 'Solicitação de vínculo',
            'body': 'Uma instituição que você administra recebeu uma nova solicitação de vínculo',
            'click_action': url
        }
