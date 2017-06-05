# -*- coding: utf-8 -*-
"""Institution Followers Handler."""

from google.appengine.ext import ndb
import json

from utils import login_required
from utils import Utils
from utils import json_response

from handlers.base_handler import BaseHandler


class InstitutionFollowersHandler(BaseHandler):
    """Get followers of specific institution."""

    @json_response
    @login_required
    def get(self, user, url_string):
        """Get followers of specific institution."""
        institution_key = ndb.Key(urlsafe=url_string)
        institution = institution_key.get()

        array = [(member.get()) for member in institution.followers]

        self.response.write(json.dumps(Utils.toJson(array)))
