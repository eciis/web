# -*- coding: utf-8 -*-
"""Send Push Notification Worker Handler."""
from handlers import BaseHandler
from google.appengine.ext import ndb
import json
from . import get_notification_props, NotificationType
from fcm import notify_multiple_users
from models import User

__all__ = ['SendPushNotificationHandler']
    

class SendPushNotificationHandler(BaseHandler):
    """Handles send push notification operation
    in the queue."""

    def post(self):
        """Sends a push notification to each user in the receivers list.
        If only one user has to receive the notification, the length of the list
        is going to be equal to 1."""
        entity = ndb.Key(urlsafe=self.request.get(
            'entity')).get() if self.request.get('entity') else None
        receivers = self.get_receivers()
        notification_type = NotificationType(self.request.get('type'))
        notification_props = get_notification_props(notification_type, entity)
        notify_multiple_users(notification_props, receivers)
    
    def get_users_from_invite(self, invite_keys):
        """This function is called when the notification's
        type is invite.
        It iterates through the invite_keys retrieving the user
        who will receive the invite and adding its key
        in the user_keys method.

        Args:
            invite_keys: An array with all the invites' keys that are
            going to be send.

        Returns:
            A list with all the users' keys who will receive invite.
        """
        user_keys = []
        for invite_key in invite_keys:
            invite = ndb.Key(urlsafe=invite_key).get()
            user = User.get_active_user(invite.invitee)
            user_key = user.key.urlsafe() if user else None
            user_keys.append(user_key)
        return user_keys
    
    def get_receivers(self):
        """Responsible for check from where the receivers
        have to be got. There are two possibilites, the receivers
        can be retrieved from the invites, when the notification's type
        is invite, or, they can be retrieved by the receivers property from
        the request, what happens for the other types.

        Returns:
            A list with all the users' keys who will receive the notification.
        """
        return (self.get_users_from_invite(json.loads(self.request.get('invites'))) 
            if self.request.get('invites') else self.request.get_all('receivers'))
