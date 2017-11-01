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


def remove_institution_from_users(remove_hierarchy, institution_key):
    """Remove institution from users."""
    taskqueue.add(
        url='/api/queue/remove-inst',
        target='worker',
        queue_name='compute-engine',
        params={
            'institution_key': institution_key,
            'remove_hierarchy': remove_hierarchy
        }
    )


def send_post_notification(post, user, entity_type):
    """Send post notification."""
    taskqueue.add(
        url='/api/queue/post-notification',
        target='worker',
        queue_name='compute-engine',
        params={
            'author_key': post.author.urlsafe(),
            'user_key': user.key.urlsafe(),
            'user_name': user.name,
            'post_key': post.key.urlsafe(),
            'entity_type': entity_type
        }
    )
