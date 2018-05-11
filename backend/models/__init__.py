"""Initialize models module."""
from .user import *
from .address import *
from .institution import *
from .event import *
from .invite_institution_children import *
from .invite_institution_parent import *

__all__ = []

__all__ += user.__all__
__all__ += institution.__all__
__all__ += address.__all__
__all__ += event.__all__
__all__ += invite_institution_children.__all__
__all__ += invite_institution_parent.__all__
