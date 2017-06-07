# -*- coding: utf-8 -*-
"""Institution Members Handler."""

from google.appengine.ext import ndb
import json

from utils import login_required
from utils import Utils
from utils import json_response

from handlers.base_handler import BaseHandler


class InstitutionMembersHandler(BaseHandler):
    """Get members of specific institution."""

    @json_response
    @login_required
    def get(self, user, url_string):
        """Get members of specific institution."""
        institution_key = ndb.Key(urlsafe=url_string)
        institution = institution_key.get()

        array = [member.get() for member in institution.members]

        self.response.write(json.dumps(Utils.toJson(array)))
