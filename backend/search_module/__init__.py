"""Initialize search modules."""
from .search_document import *


search_modules = [search_document]

__all__ = [prop for search_module in search_modules for prop in search_module.__all__]
