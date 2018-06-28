"""Initialize util modules."""

from .json_patch import *
from .strings_pt_br import *
from .notification import *
from .notifications_queue_manager import *
from .login_service import *


util_modules = [json_patch, strings_pt_br, login_service, notification, notifications_queue_manager]

__all__ = [prop for util_module in util_modules for prop in util_module.__all__]