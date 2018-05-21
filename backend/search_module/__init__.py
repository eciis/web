"""Initialize search modules."""
from .search_document import *
from .search_institution import *
from .search_user import *


search_modules = [search_document, search_institution, search_user]

__all__ = [prop for search_module in search_modules for prop in search_module.__all__]
