# -*- coding: utf-8 -*-
"""User Institutions Handler."""

from google.appengine.ext import ndb
import json

from utils import login_required
from utils import Utils
from utils import json_response

from handlers.base_handler import BaseHandler


class UserInstitutionsHandler(BaseHandler):
    """Handle user's operations relationed to an especific institution."""

    @json_response
    @login_required
    def delete(self, user, institution_key):
        """Handle DELETE Requests."""
        institution_key = ndb.Key(urlsafe=institution_key)
        institution = institution_key.get()

        user.remove_institution(institution_key)

        institution.remove_member(user)
