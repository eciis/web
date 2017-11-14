# -*- coding: utf-8 -*-
"""Vote Handler."""

from google.appengine.ext import ndb
from utils import login_required
from utils import json_response
from handlers.base_handler import BaseHandler
from custom_exceptions.notAuthorizedException import NotAuthorizedException
from utils import Utils
import json


class VoteHandler(BaseHandler):
    """Vote Handler."""

    @json_response
    @login_required
    @ndb.transactional(xg=True)
    def post(self, user, survey_key):
        """Handle POST Requests."""
        survey = ndb.Key(urlsafe=survey_key).get()
        # The array contains options
        options_selected = json.loads(self.request.body)

        institution = survey.institution.get()
        Utils._assert(institution.state == 'inactive',
                      "The institution has been deleted", NotAuthorizedException)

        survey.vote(user.key.urlsafe(), options_selected)
        survey.put()
