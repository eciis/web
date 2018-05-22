"""Initialize custom exceptions modules."""

from .entityException import *

exceptions = [entityException]

__all__ = [prop for exception in exceptions for prop in exception.__all__]
