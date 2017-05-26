# -*- coding: utf-8 -*-
"""Institution Follower."""

import json

from google.appengine.ext import ndb
from utils import Utils
from utils import login_required
from utils import json_response

from models.institution import Institution

from handlers.base_handler import BaseHandler


class InstitutionFollowerHandler(BaseHandler):
    """Institution Collection."""

    @json_response
    @login_required
    def get(self, url_string):
        """Get all followers the institution."""
        institution_key = ndb.Key(urlsafe=url_string)
        institution = institution_key.get()
        assert type(institution) is Institution, "Key is not an Institution"

        followers = institution.followers

        self.response.write(json.dumps(
            Utils.toJson(followers, host=self.request.host)
        ))

    @json_response
    @login_required
    def post(self, url_string):
        """Add follower in the institution."""
        institution_key = ndb.Key(urlsafe=url_string)
        institution = institution_key.get()
        assert type(institution) is Institution, "Key is not an Institution"

        from models.user import User
        data = json.loads(self.request.body)
        user = User.get_by_id(data["id"])

        user.add_followers(institution_key)
        institution.add_followers(user.key)

        self.response.write(json.dumps(
            Utils.toJson(institution.followers, host=self.request.host)
        ))
