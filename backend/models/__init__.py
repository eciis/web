"""Initialize models module."""

from .user import *
from .address import *
from .institution import *

__all__ = []

__all__ += user.__all__
__all__ += institution.__all__
__all__ += address.__all__
