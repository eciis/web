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
from datetime import datetime
from custom_exceptions import QueryException

__all__ = ['EventCollectionHandler']

def get_date_filters(filters):
    """Get a dict with the filters month and year.

    Args:
        filters: A list of tuples with name and value.
    """
    date_filters = {}
    for item in filters:
        if item[0] == 'month' or item[0] == 'year':
            date_filters[item[0]] = int(item[1])
    return date_filters

def get_filtered_events(filters, user):
    """Get query of events based on filters by date or not.

    Args:
        filters: A list of tuples with the name and value of filters to the query.
        Filters by month and year are used to get events by date.
        user: The current logged user.
    """
    date_filters = get_date_filters(filters)
    if date_filters:
        month = date_filters['month']
        year = date_filters['year']
        december = month == 12
        current_date = datetime(year, month, 1, 3)
        next_date = datetime(year if not december else year+1, month+1 if not december else 1, 1, 3)
        query = ndb.gql("SELECT __key__ FROM Event WHERE institution_key IN :1 AND state =:2 AND start_time < DATETIME(:3)",
            user.follows, 'published', next_date.strftime("%Y-%m-%d %H:%M:%S"))
        if query.count() > 0:
            return ndb.gql("SELECT * FROM Event WHERE __key__ IN :1 AND end_time >= DATETIME(:2)",
                query.fetch(), current_date.strftime("%Y-%m-%d %H:%M:%S")).order(Event.start_time, Event.key)
        return query.order(Event.start_time, Event.key)
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
            queryEvents = get_filtered_events(self.request.GET.items(), user)
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
