# -*- coding: utf-8 -*-
"""Institution Events Handler."""


from . import BaseHandler
from google.appengine.ext import ndb

import json
from utils import Utils
from models import Event
from utils import login_required
from utils import json_response
from utils import query_paginated
from utils import to_int
from custom_exceptions.queryException import QueryException

__all__ = ['InstitutionEventsHandler']

class InstitutionEventsHandler(BaseHandler):
    """Institution Events Handler."""

    @login_required
    @json_response
    def get(self, user, institution_key):
        """Handle get requests."""
        array = []
        more = False

        institution_key = ndb.Key(urlsafe=institution_key)

        queryEvents = Event.query(Event.institution_key == institution_key,
                                  Event.state == 'published').order(Event.start_time, Event.key)
        
        queryEvents, more = query_paginated(
            self.request.GET.items(), queryEvents)

        array = [Utils.toJson(Event.make(event), host=self.request.host)
                 for event in queryEvents]

        data = {
            'events': array,
            'next': more
        }

        self.response.write(json.dumps(data))
