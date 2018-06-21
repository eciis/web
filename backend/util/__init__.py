"""Initialize util modules."""

from .json_patch import *
from .strings_pt_br import *
from .login_service import *
from .notifications_queue_manager import *


util_modules = [json_patch, strings_pt_br, login_service, notifications_queue_manager]

__all__ = [prop for util_module in util_modules for prop in util_module.__all__]