"""Entities' service."""
from google.appengine.api import taskqueue


def enqueue_task(handler_selector, params):
    """Send tasks to queue."""
    taskqueue.add(
        url='/api/queue/' + handler_selector,
        target='worker',
        queue_name='compute-engine',
        params=params
    )
