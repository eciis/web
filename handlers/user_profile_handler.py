# -*- coding: utf-8 -*-
"""User Profile Handler."""

import json

from utils import Utils
from utils import login_required
from utils import json_response

from handlers.base_handler import BaseHandler

from google.appengine.ext import ndb


def makeUser(user, request):
    """TODO: Move this method to User when utils.py is refactored.

    @author Andre L Abrantes - 20-06-2017
    """
    user_json = Utils.toJson(user, host=request.host)
    user_json['institution_profiles'] = [profile.make() for profile in user.institution_profiles]
    return user_json


class UserProfileHandler(BaseHandler):
    """User Profile Handler."""

    @json_response
    @login_required
    def get(self, user, user_key):
        """Handle GET Requests."""
        return_user = ndb.Key(urlsafe=user_key).get()
        user_json = makeUser(return_user, self.request)
        self.response.write(json.dumps(user_json))
