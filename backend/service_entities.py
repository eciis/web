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


def send_post_notification(post, user, entity_type):
    """Send post notification."""
    taskqueue.add(
        url='/api/queue/post-notification',
        target='worker',
        queue_name='comput-engine',
        params={
            'author_key': post.author.urlsafe(),
            'user_key': user.key.urlsafe(),
            'user_name': user.name,
            'post_key': post.key.urlsafe(),
            'entity_type': entity_type
        }
    )
