"""Notification model."""

import time
from service_messages import send_message_notification

__all__ = ['Notification', 'notification_id']

notification_id = {
    "00": "ALL_NOTIFICATIONS",
    "01": "ACCEPT_INSTITUTION_LINK",
    "02": "ACCEPT_INVITE_HIERARCHY",
    "03": "ACCEPT_INVITE_USER_ADM",
    "04": "ADD_ADM_PERMISSIONS",
    "05": "TRANSFER_ADM_PERMISSIONS",
    "06": "RE_ADD_ADM_PERMISSIONS",
    "07": "REMOVE_INSTITUTION_LINK"
}

def get_notification_id(notification_type):
    """
    Method that takes the id of a given notification in 
    the notification_id dictionary, if the notification 
    does not exist in the dictionary, returns the id '00'.

    Keyword arguments:
    notification_type -- Type of notification to get id.
    """
    for key, value in notification_id.items():
        if value == notification_type:
            return key
    
    return "00"


class Notification(object):
    """
    Class to create notification.
    """

    def __init__(self, message, entity_key, notification_type, receiver_key):
        """
        Constructor of class Notification.

        Keyword arguments:
        message -- Message dictionary of notification.
        entity_key -- entity key of type invite.
        notification_type -- type of notification. 
        receiver_key -- Urlsafe of the user who will receive the notification.
        """
        self.message = message
        self.entity_key = entity_key
        self.notification_type = notification_type
        self.notification_group = self._get_notification_group(notification_type)
        self.receiver_key = receiver_key
        self.key = self._generate_key()
    
    def format_notification(self):
        """
        Method that returns a dictionary with the attributes needed to send the notification.
        """
        return {
            'receiver_key': self.receiver_key,
            'message': self.message,
            'notification_type': self.notification_type,
            'entity_key': self.entity_key
        }
    
    def _generate_key(self):
        """
        Method that generates a unique key for the created notification. 
        Using to generate the key the notification type id, the hash 
        of the entity_key, the hash of the receiver_key, and the current 
        date in seconds.
        """
        id = get_notification_id(self.notification_group)
        entity_hash = hash(self.entity_key)
        receiver_hash = hash(self.receiver_key)
        timestamp = time.time()

        key = id + '-' + str(entity_hash) + str(receiver_hash) + str(timestamp)
        key = key.replace(".", "")
        return key
    
    def _get_notification_group(self, notification_type):
        """
        Method to get the notification group according to the notifications_id dictionary. 
        If the notification type already exists in the dictionary, it is returned, 
        otherwise the default type 'ALL_NOTIFICATIONS' is returned.
        """
        return notification_type if notification_type in notification_id.values() else "ALL_NOTIFICATIONS"
    
    def send_notification(self):
        """
        Method to send notification.
        """
        send_message_notification(**self.format_notification())
    
    def __str__(self):
        """
        Method to generate string representation of notification object.
        """
        formated_notification = self.format_notification()
        formated_notification['key'] = self.key

        return self.__class__.__name__ + " " + str(formated_notification)
    
    def __repr__(self):
        """
        Method to generate string representation of notification object.
        """
        return str(self)
