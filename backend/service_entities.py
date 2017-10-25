"""Entities' service."""
from google.appengine.api import taskqueue


def remove_institution_from_users(remove_hierarchy, institution_key):
    """Remove institution from users."""
    taskqueue.add(
        url='/api/queue/remove-inst',
        target='worker',
        params={
            'institution_key': institution_key,
            'remove_hierarchy': remove_hierarchy
        }
    )


def send_post_notification(author_key, user_key, user_name, post_key, entity_type):
    """Send post notification."""
    taskqueue.add(
        url='/api/queue/post-notification',
        target='worker',
        queue_name='comput-queue',
        params={
            'author_key': author_key,
            'user_key': user_key,
            'user_name': user_name,
            'post_key': post_key,
            'entity_type': entity_type
        }
    )
