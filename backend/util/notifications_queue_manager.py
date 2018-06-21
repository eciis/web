"""Notifications Queue Manager."""

import json
import time
from google.appengine.api import taskqueue
from protorpc import messages

__all__ = ['NotiticationsQueueManager', 'NotificationMessage']

queue = taskqueue.Queue('notifications-manage-pull')
notification_id = {
    "00": "ALL_NOTIFICATIONS",
    "01": "ACCEPT_INSTITUTION_LINK",
    "02": "ACCEPT_INVITE_HIERARCHY",
    "03": "ACCEPT_INVITE_USER_ADM"
}

def get_notification_id(notification_type):
    for key, value in notification_id.items():
        if value == notification_type:
            return key
    
    return "00"

class NotiticationsQueueManager:
    
    @staticmethod
    def create_notification_task(notification_message):
        message = notification_message.message
        notification_type = notification_message.notification_type
        notification_key = notification_message.key

        task = taskqueue.Task(
            name=notification_key,
            payload=json.dumps(message),
            tag=notification_type,
            method='PULL'
        )
        queue.add(task)

        return notification_key

    
    @staticmethod
    def resolve_notification_task(notification_id):
        pass


class NotificationMessage(object):
    def __init__(self, message, entity_urlsafe, notification_type, receiver_urlsafe):
        self.message = message
        self.entity_urlsafe = entity_urlsafe
        self.notification_type = notification_type
        self.receiver_urlsafe = receiver_urlsafe
        self.key = self._gererate_key()
    
    def format_notification(self):
        return {
            'receiver_key': self.receiver_urlsafe,
            'message': self.message,
            'notification_type': self.notification_type,
            'entity_key': self.entity_urlsafe
        }
    
    def _gererate_key(self):
        id = get_notification_id(self.notification_type)
        entity_hash = hash(self.entity_urlsafe)
        receiver_hash = hash(self.receiver_urlsafe)
        timestamp = time.time()

        key = id + '-' + str(entity_hash) + str(receiver_hash) + str(timestamp)
        key = key.replace(".", "")
        return key
