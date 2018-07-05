"""Notifications Queue Manager."""

import json
import time
from google.appengine.api import taskqueue
from service_messages import send_message_notification
from . import Notification, notification_id
from utils import Utils
from custom_exceptions import QueueException

__all__ = ['NotificationsQueueManager']

queue = taskqueue.Queue('notifications-manage-pull')

def find_task(notification_type, task_id, num_fetchs=0):
    """
    Method to find tasks in the queue, based on the task 
    id and the grouping (notification_type), both passed by parameter.
    If it does not find it, returns None.
    
    Keyword arguments:
    notification_type - Notification type to catch of just task of specified type.
    task_id -- Id of the task to be found.
    num_fetchs -- (Optional) Current number of tasks that have already been taken from the queue.
    """
    num_tasks = queue.fetch_statistics().tasks
    fetchs = 100
    
    if num_fetchs <= num_tasks:
        tasks = queue.lease_tasks_by_tag(0, fetchs, notification_type)
        task = reduce(lambda found, task: task if task.name == task_id else found, tasks, None)
        
        return task if task else find_task(notification_type, task_id, num_fetchs+fetchs)

    return None

class NotificationsQueueManager:
    """
    Class to manage the notification queue.
    """
    
    @staticmethod
    def create_notification_task(notification):
        """
        Method for creating a task from the notification and 
        add it to the queue. Returns the task key.

        Keyword arguments:
        notification -- Notification that will be used to create the task.
        """
        Utils._assert(
            not isinstance(notification, Notification),
            "Expected type Notification but got %s." %(type(notification).__name__),
            TypeError
        )

        notification_type = notification.notification_group
        notification_key = notification.key

        task = taskqueue.Task(
            name=notification_key,
            payload=json.dumps(notification.format_notification()),
            tag=notification_type,
            method='PULL'
        )
        queue.add(task)

        return notification_key

    
    @staticmethod
    def resolve_notification_task(task_key):
        """
        Method to get a queue task, if any, re-create the 
        notification, resolve it and delete the queue task.

        Keyword arguments:
        task_key -- Task key to be resolved.
        """
        task_id = task_key[:2]
        Utils._assert(
            not task_id in notification_id,
            'Invalid task key.',
            QueueException
        )

        notification_type = notification_id[task_id]
        task = find_task(notification_type,task_key)

        Utils._assert(
            not task,
            'Task not found.',
            QueueException
        )

        notification = Notification(**json.loads(task.payload))
        notification.send_notification()
        queue.delete_tasks([task])
