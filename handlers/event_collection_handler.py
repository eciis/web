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


class EventCollectionHandler(BaseHandler):
    """Event  Collection Handler."""

    @login_required
    @json_response
    def get(self, user):
        """Get events of all institutions that user follow."""
        array = []
        if len(user.follows) > 0:
            queryEvents = Event.query(Event.institution_key.IN(
                user.follows), Event.state == 'published').order(Event.start_time)
            array = [Utils.toJson(Event.make(event), host=self.request.host) for event in queryEvents]

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

        event = Event.create(data, user.key, user.name, user.photo_url,
                             institution_key, institution.name, institution.photo_url)
        event.put()

        self.response.write(json.dumps(Utils.toJson(Event.make(event), host=self.request.host)))
