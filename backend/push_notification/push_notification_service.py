# -*- coding: utf-8 -*-
"""Push Notification Service."""
from custom_exceptions import EntityException
from enum import Enum

__all__ = ['get_notification_props', 'NotificationType']

def get_notification_props(_type, entity=None):
    """This function represents the interface
    the service's provides to the application
    to get the notification properties.

    Args:
        _type -- the notification's type
        entity -- an optional parameter that can be
        used to determine the click_action property 
    """
    notification = NotificationProperties(_type, entity)
    return notification.get_props()

class NotificationType(Enum):
    """This Enum wraps the
    possible notification's type
    to make them more maintable 
    """
    like = 'LIKE_POST'
    comment = 'COMMENT'
    invite_user = 'USER'
    invite_user_adm = 'USER_ADM'
    link = 'LINK'

class NotificationProperties(object):
    """This class has several private
    methods, each one for an especific
    notification's type. These methods
    return an object with the notification
    properties.
    To access them, the instance is initialized
    with a notification_method which is set based on
    the _type property received by the constructor,
    this method is called in get_props, the unique
    public method.
    """

    def __init__(self, _type, entity):
        """Set the notification_method based on the _type.
        types object helps this operation by maping a notification's
        type to its especific method.
        The entity, also, is set here.
        """
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
        """Just returns the result of
        notification_method().
        """
        return self.notification_method()
 
    def __get_like_props(self):
        """Responsible for return the right
        properties for the like notification.
        self.entity can't be None once it is
        used to set the url of the click_action property.
        """
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
        """Responsible for return the right
        properties for the comment notification.
        self.entity can't be None once it is
        used to set the url of the click_action property.
        """
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
        """Responsible for return the right
        properties for the invite_user notification.
        """
        url = "/notifications"

        return {
            'title': 'Novo convite',
            'body': 'Você recebeu um novo convite para ser membro de uma instituição',
            'click_action': url
        }

    def __get_invite_user_adm_props(self):
        """Responsible for return the right
        properties for the invite_user_adm notification.
        """
        url = "/notifications"

        return {
            'title': 'Novo convite',
            'body': 'Você recebeu um novo convite para ser administrador de uma instituição',
            'click_action': url
        }

    def __get_link_props(self):
        """Responsible for return the right
        properties for the link notification.
        """
        url = "/institution/%s/inviteInstitution" % self.entity.key.urlsafe()

        return {
            'title': 'Solicitação de vínculo',
            'body': 'Uma instituição que você administra recebeu uma nova solicitação de vínculo',
            'click_action': url
        }
