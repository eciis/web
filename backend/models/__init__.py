"""Initialize models module."""

from .user import *
from .address import *
from .institution import *
from .event import *

__all__ = []

__all__ += user.__all__
__all__ += institution.__all__
__all__ += address.__all__
__all__ += event.__all__
