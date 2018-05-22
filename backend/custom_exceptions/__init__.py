"""Initialize custom exceptions modules."""

from .entityException import *
from .fieldException import *

exceptions = [entityException, fieldException]

__all__ = [prop for exception in exceptions for prop in exception.__all__]
