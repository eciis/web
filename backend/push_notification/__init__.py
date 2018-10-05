"""Initialize push_notification module."""

from .push_notification_service import *
from .send_push_notification_worker_handler import *

notifications = [
    push_notification_service, send_push_notification_worker_handler
]

__all__ = [prop for notification in notifications for prop in notification.__all__]
