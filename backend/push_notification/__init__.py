"""Initialize push_notification module."""

from .comment_push_notification import *
from .like_push_notification import *
from .link_push_notification import *
from .invite_member_push_notification import *
from .push_notification_service import get_notification_props


notifications = [
    comment_push_notification, like_push_notification, link_push_notification,
    invite_member_push_notification, push_notification_service
]

__all__ = [prop for notification in notifications for prop in notification.__all__]
