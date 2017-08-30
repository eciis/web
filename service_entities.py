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
