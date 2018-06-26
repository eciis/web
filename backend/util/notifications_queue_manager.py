"""Notifications Queue Manager."""

import json
import time
from google.appengine.api import taskqueue
from service_messages import send_message_notification

__all__ = ['NotificationsQueueManager', 'Notification', 'NotificationNIL']

queue = taskqueue.Queue('notifications-manage-pull')
notification_id = {
    "00": "ALL_NOTIFICATIONS",
    "01": "NOTIFICATION_NIL",
    "02": "ACCEPT_INSTITUTION_LINK",
    "03": "ACCEPT_INVITE_HIERARCHY",
    "04": "ACCEPT_INVITE_USER_ADM",
    "05": "ADD_ADM_PERMISSIONS"
}

def get_notification_id(notification_type):
    for key, value in notification_id.items():
        if value == notification_type:
            return key
    
    return "00"

def find_task(notification_type, task_id, num_fetchs=0):
    num_tasks = queue.fetch_statistics().tasks
    
    if num_fetchs <= num_tasks:
        tasks = queue.lease_tasks_by_tag(0, 100, notification_type)
        task = reduce(lambda found, task: task if task.name == task_id else found, tasks, None)
        
        return task if task else find_task(notification_type, task_id, num_fetchs+100)

    return None

def create_notification(notification_id, **kwords):
    switch = {
        "01": NotificationNIL,
        "OTHERWISE": Notification
    }

    return switch.get(notification_id, switch['OTHERWISE'])(**kwords)

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
        task = find_task(notification_type,task_id)

        if task:
            notification = create_notification(task_id[:2], **json.loads(task.payload))
            notification.send_notification()
            queue.delete_tasks([task])


class Notification(object):
    def __init__(self, message, entity_key, notification_type, receiver_key):
        self.message = message
        self.entity_key = entity_key
        self.notification_type = self._get_notification_type(notification_type)
        self.receiver_key = receiver_key
        self.key = self._generate_key()
    
    def format_notification(self):
        return {
            'receiver_key': self.receiver_key,
            'message': self.message,
            'notification_type': self.notification_type,
            'entity_key': self.entity_key
        }
    
    def _generate_key(self):
        id = get_notification_id(self.notification_type)
        entity_hash = hash(self.entity_key)
        receiver_hash = hash(self.receiver_key)
        timestamp = time.time()

        key = id + '-' + str(entity_hash) + str(receiver_hash) + str(timestamp)
        key = key.replace(".", "")
        return key
    
    def _get_notification_type(self, notification_type):
        return notification_type if notification_type in notification_id.values() else "ALL_NOTIFICATIONS"
    
    def send_notification(self):
        send_message_notification(**self.format_notification())


class NotificationNIL(Notification):
    def __init__(self):
        super(NotificationNIL, self).__init__(
            message='NIL',
            entity_key='NIL',
            notification_type='NOTIFICATION_NIL',
            receiver_key='NIL'
        )
    
    def send_notification(self):
        pass
