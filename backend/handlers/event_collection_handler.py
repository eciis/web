# -*- coding: utf-8 -*-
"""Calendar Handler."""


from . import BaseHandler
from google.appengine.ext import ndb

import json
from utils import Utils
from models import Event
from util import login_required
from utils import json_response
from utils import NotAuthorizedException
from utils import query_paginated
from utils import to_int
from datetime import datetime
from custom_exceptions import QueryException

__all__ = ['EventCollectionHandler']

def get_query_events(filters, user):
    """Get query of events based on filters by date or not.

    Args:
        filters: A list of tuples with the name and value of filters to the query
        Filters by month and year are in end of list
        user: The current logged user.
    """
    if len(filters) > 2:
        month = int(filters[2][1])
        year = int(filters[3][1])
        current_month = datetime(year, month, 1)
        next_month = datetime(year if month < 12 else year+1, month+1 if month < 12 else 1, 1)
        return Event.query(Event.institution_key.IN(
            user.follows), Event.state == 'published',
            Event.start_time >= current_month, Event.start_time < next_month).order(Event.start_time, Event.key)
    else:
        return Event.query(Event.institution_key.IN(
            user.follows), Event.state == 'published').order(Event.start_time, Event.key)

class EventCollectionHandler(BaseHandler):
    """Event  Collection Handler."""

    @login_required
    @json_response
    def get(self, user):
        """Get events of all institutions that user follow."""
        array = []
        more = False

        if len(user.follows) > 0:
            queryEvents = get_query_events(self.request.GET.items(), user)
            page_params = self.request.GET.items()[0:2]
            queryEvents, more = query_paginated(
                page_params, queryEvents)

            array = [Utils.toJson(Event.make(event), host=self.request.host) for event in queryEvents]

        data = {
            'events': array,
            'next': more
        }

        self.response.write(json.dumps(data))

    @json_response
    @login_required
    def post(self, user):
        """Post Event."""
        data = json.loads(self.request.body)
        institution_key = ndb.Key(urlsafe=data['institution_key'])
        institution = institution_key.get()

        Utils._assert(not institution.is_active(),
                      "This institution is not active", NotAuthorizedException)

        event = Event.create(data, user, institution)
        event.put()
        user.add_permissions(['remove_post', 'edit_post'], event.key.urlsafe())
        user.put()

        self.response.write(json.dumps(Utils.toJson(Event.make(event), host=self.request.host)))
