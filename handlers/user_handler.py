# -*- coding: utf-8 -*-
"""User Handler."""

import json

from utils import Utils
from utils import login_required
from utils import json_response

from util.json_patch import JsonPatch

from handlers.base_handler import BaseHandler

from google.appengine.ext import ndb


class UserHandler(BaseHandler):
    """User Handler."""

    @json_response
    @login_required
    def get(self, user):
        """Handle GET Requests."""
        user_json = Utils.toJson(user, host=self.request.host)
        user_json['logout'] = 'http://%s/logout?redirect=%s' %\
            (self.request.host, self.request.path)
        user_json['institutions'] = []
        for institution in user.institutions:
            user_json['institutions'].append(
                Utils.toJson(institution.get())
            )
        self.response.write(json.dumps(user_json))

    @login_required
    @ndb.transactional(xg=True)
    def put(self, user):
        """Handler PATCH Requests."""
        data = json.loads(self.request.body)

        institution_key = ndb.Key(urlsafe=data['institutions'][0])

        user.add_institution(institution_key)
        user.follow(institution_key)

        institution = institution_key.get()

        institution.add_member(user.key)
        institution.follow(user.key)

    @json_response
    @login_required
    def patch(self, user):
        """Handler PATCH Requests."""
        data = self.request.body

        """Apply patch."""
        JsonPatch.load(data, user)

        """Update user."""
        user.put()