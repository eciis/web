# -*- coding: utf-8 -*-
"""Institution Handler."""

import json

from google.appengine.ext import ndb

from utils import Utils
from utils import login_required
from utils import json_response

from models.institution import Institution

from handlers.base import BaseHandler


class InstitutionHandler(BaseHandler):
    """Institution Handler."""

    @json_response
    @login_required
    def get(self, user, url_string):
        """Handle GET Requests."""
        obj_key = ndb.Key(urlsafe=url_string)
        obj = obj_key.get()
        assert type(obj) is Institution, "Key is not an Institution"
        self.response.write(json.dumps(
            Utils.toJson(obj, host=self.request.host)
        ))
