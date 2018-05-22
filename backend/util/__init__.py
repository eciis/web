"""Initialize util modules."""

from .json_patch import *
from .strings_pt_br import *
from .login_service import *


util_modules = [json_patch, strings_pt_br, login_service]

__all__ = [prop for util_module in util_modules for prop in util_module.__all__]