# -*- coding: utf-8 -*-
"""Institution Events Handler."""


from handlers.base_handler import BaseHandler
from google.appengine.ext import ndb

import json
from utils import Utils
from models.event import Event
from utils import login_required
from utils import json_response
from utils import offset_pagination
from utils import to_int
from custom_exceptions.queryException import QueryException


class InstitutionEventsHandler(BaseHandler):
    """Institution Events Handler."""

    @login_required
    @json_response
    def get(self, user, institution_key):
        page = to_int(
            self.request.get('page', Utils.DEFAULT_PAGINATION_OFFSET),
            QueryException,
            "Query param page must be an integer")
        limit = to_int(
            self.request.get('limit', Utils.DEFAULT_PAGINATION_LIMIT),
            QueryException,
            "Query param limit must be an integer")

        array = []
        more = False

        institution_key = ndb.Key(urlsafe=institution_key)

        queryEvents = Event.query(Event.institution_key == institution_key,
                                  Event.state == 'published').order(Event.start_time, Event.key)
        queryEvents, more = offset_pagination(
            page,
            limit,
            queryEvents)

        array = [Utils.toJson(Event.make(event), host=self.request.host)
                 for event in queryEvents]

        data = {
            'events': array,
            'next': more
        }

        self.response.write(json.dumps(data))
