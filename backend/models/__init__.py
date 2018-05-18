"""Initialize models module."""
from .address import *
from .institution import *
from .user import *
from .event import *
from .invite import *
from .invite_institution import *
from .invite_institution_children import *
from .invite_institution_parent import *
from .invite_user import *
from .invite_user_adm import *
from .request import *
from .request_user import *
from .request_institution import *
from .request_institution_parent import *
from .request_institution_children import *
from .factory_invites import *


models = [
    user, address, institution, event, invite, invite_institution, 
    invite_institution_children, invite_institution_parent, invite_user, 
    request, request_user, request_institution_parent, request_institution_children,
    invite_user_adm, request_institution, factory_invites
]

__all__ = [prop for model in models for prop in model.__all__]
