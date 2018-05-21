"""Initialize send email hierarchy modules."""

from .email_sender import *
from .accepted_institution_email_sender import *
from .invite_institution_email_sender import *


email_modules = [
    email_sender, accepted_institution_email_sender, invite_institution_email_sender
]

__all__ = [prop for email_module in email_modules for prop in email_module.__all__]