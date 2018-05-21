"""Initialize util modules."""

from .json_patch import *


util_modules = [json_patch]

__all__ = [prop for util_module in util_modules for prop in util_module.__all__]