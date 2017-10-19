# -*- coding: utf-8 -*-
"""Survey Post Handler."""
import json
from google.appengine.ext import ndb
from utils import login_required
from utils import is_authorized
from utils import json_response
from models.post import SurveyPost
from handlers.base_handler import BaseHandler
from handlers.post_handler import getLikes


class SurveyPostHandler(BaseHandler):
    """Survey Post Handler."""

    @json_response
    @login_required
    def get(self, user, url_string):
        """Handle GET Requests."""
        survey_key = ndb.Key(urlsafe=url_string)
        survey = survey_key.get()

        assert type(survey) is SurveyPost, "Key is not an Survey Post"
        survey_json = SurveyPost.make(survey, self.request.host)
        survey_json['data_comments'] = survey.comments
        survey_json['data_likes'] = getLikes(survey, self.request.host)

        self.response.write(json.dumps(
            survey_json
        ))

    @json_response
    @login_required
    @is_authorized
    def delete(self, user, key):
        """Handle DELETE Requests."""
        """Get the post from the datastore."""
        survey_key = ndb.Key(urlsafe=key)
        survey = survey_key.get()

        """Set the informations about post."""
        survey.delete(user)
