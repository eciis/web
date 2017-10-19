# -*- coding: utf-8 -*-
"""Survey Post  Collection Handler."""

from google.appengine.ext import ndb
import json
from utils import Utils
from utils import login_required
from utils import json_response

from handlers.base_handler import BaseHandler
from models.survey_post import SurveyPost
from service_messages import send_message_notification

from custom_exceptions.notAuthorizedException import NotAuthorizedException


class SurveyPostCollectionHandler(BaseHandler):
    """SurveyPost  Collection Handler."""

    @json_response
    @login_required
    @ndb.transactional(xg=True)
    def post(self, user):
        """Handle POST Requests."""
        data = json.loads(self.request.body)
        institution_key = data['institution']
        institution = ndb.Key(urlsafe=institution_key).get()

        Utils._assert(institution.state == 'inactive',
                      "The institution has been deleted",
                      NotAuthorizedException)

        Utils._assert(not user.has_permission("publish_survey_post", institution_key),
                      "You don't have permission to publish post.",
                      NotAuthorizedException)

        try:
            survey = SurveyPost.create(data, user.key, institution.key)
            survey.put()

            """ Update Institution."""
            institution.posts.append(survey.key)
            institution.put()

            """ Update User."""
            user.posts.append(survey.key)
            user.put()

            entity_type = 'SURVEY_POST'
            message = {'type': 'SURVEY_POST', 'from': user.name.encode('utf8')}
            for follower in institution.followers:
                if follower != user.key:
                    send_message_notification(
                        follower.urlsafe(),
                        json.dumps(message),
                        entity_type,
                        survey.key.urlsafe())

            self.response.write(json.dumps(
                SurveyPost.make(survey, self.request.host)))
        except Exception as error:
            self.response.set_status(Utils.BAD_REQUEST)
            self.response.write(Utils.getJSONError(
                Utils.BAD_REQUEST, error.message))
