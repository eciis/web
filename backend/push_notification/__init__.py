"""Initialize push_notification module."""

from .push_notification_service import *

notifications = [
    push_notification_service
]

__all__ = [prop for notification in notifications for prop in notification.__all__]
