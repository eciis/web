# -*- coding: utf-8 -*-
"""Vote Handler."""

from google.appengine.ext import ndb
from util import login_required
from utils import json_response
from . import BaseHandler
from custom_exceptions import NotAuthorizedException
from utils import Utils
import json

__all__ = ['VoteHandler']

class VoteHandler(BaseHandler):
    """Vote Handler."""

    @json_response
    @login_required
    def post(self, user, survey_key):
        """Handle POST Requests."""
        survey_key = ndb.Key(urlsafe=survey_key)
        survey = survey_key.get()
        # The array contains options
        options_selected = json.loads(self.request.body)

        institution = survey.institution.get()
        Utils._assert(not institution.is_active(),
                      "This institution is not active", NotAuthorizedException)

        Utils._assert(user.key in survey.voters,
                      "You've already voted in this survey", NotAuthorizedException)

        user_dict = {'name': user.name,
                     'photo_url': user.photo_url,
                     'key': user.key.urlsafe()}

        survey.vote(user_dict, options_selected)
        self.response.write(json.dumps(survey.make(self.request.host)))

