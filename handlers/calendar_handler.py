# -*- coding: utf-8 -*-
"""Calendar Handler."""


from handlers.base_handler import BaseHandler
from google.appengine.ext import ndb

import json
from utils import Utils
from models.event import Event
from utils import login_required
from utils import json_response
from utils import NotAuthorizedException


class CalendarHandler(BaseHandler):
    """Event  Collection Handler."""

    @login_required
    @json_response
    def get(self, user):
        """Get events of all institutions that user follow."""
        array = []
        if len(user.follows) > 0:
            queryEvents = Event.query(Event.institution_key.IN(
                user.follows))

            array = [Event.make(event) for event in queryEvents]

        self.response.write(json.dumps(array))

    @json_response
    @login_required
    def post(self, user):
        """Post Event."""
        data = json.loads(self.request.body)
        institution_key = ndb.Key(urlsafe=data['institution_key'])
        institution = institution_key.get()

        Utils._assert(institution.state == 'inactive',
                      "The institution has been deleted", NotAuthorizedException)

        event = Event.create(data, user.key, institution_key)
        event.author_key = user.key
        event.put()

        self.response.write(json.dumps(Event.make(event)))
