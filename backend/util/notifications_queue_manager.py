"""Notifications Queue Manager."""

import json
import time
from google.appengine.api import taskqueue
from service_messages import send_message_notification

__all__ = ['NotificationsQueueManager', 'Notification']

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

notifications_tasks = []

def get_notification_tasks(notification_type, notifications_tasks):
    notifications_tasks += queue.lease_tasks_by_tag(10, 100, notification_type)

class NotificationsQueueManager:
    
    @staticmethod
    def create_notification_task(notification_message):
        notification_type = notification_message.notification_type
        notification_key = notification_message.key

        task = taskqueue.Task(
            name=notification_key,
            payload=json.dumps(notification_message.format_notification()),
            tag=notification_type,
            method='PULL'
        )
        queue.add(task)

        return notification_key

    
    @staticmethod
    def resolve_notification_task(task_id):
        notification_type = notification_id[task_id[:2]]
        task = reduce(lambda found, task: task if task.name == task_id else found, notifications_tasks, None)

        if task:
            notification = Notification(**json.loads(task.payload))
            send_message_notification(**notification.format_notification())
            queue.delete_tasks([task])
        else:
            get_notification_tasks(notification_type, notifications_tasks)
            NotificationsQueueManager.resolve_notification_task(task_id)


class Notification(object):
    def __init__(self, message, entity_key, notification_type, receiver_key):
        self.message = message
        self.entity_key = entity_key
        self.notification_type = notification_type
        self.receiver_key = receiver_key
        self.key = self._gererate_key()
    
    def format_notification(self):
        return {
            'receiver_key': self.receiver_key,
            'message': self.message,
            'notification_type': self.notification_type,
            'entity_key': self.entity_key
        }
    
    def _gererate_key(self):
        id = get_notification_id(self.notification_type)
        entity_hash = hash(self.entity_key)
        receiver_hash = hash(self.receiver_key)
        timestamp = time.time()

        key = id + '-' + str(entity_hash) + str(receiver_hash) + str(timestamp)
        key = key.replace(".", "")
        return key
    
