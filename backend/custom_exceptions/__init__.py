"""Initialize custom exceptions modules."""

from .entityException import *
from .fieldException import *
from .notAuthorizedException import *

exceptions = [entityException, fieldException, notAuthorizedException]

__all__ = [prop for exception in exceptions for prop in exception.__all__]
