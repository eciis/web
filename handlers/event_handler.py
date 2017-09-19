# -*- coding: utf-8 -*-
"""Event Handler."""

from google.appengine.ext import ndb

from utils import login_required
from handlers.base_handler import BaseHandler


class EventHandler(BaseHandler):
    """Event Handler."""

    @login_required
    def delete(self, user, key):
        """Change event state from 'published' to 'deleted'."""
        event_key = ndb.Key(urlsafe=key)
        event = event_key.get()
        event.state = 'deleted'
        event.last_modified_by = user.key
        event.last_modified_by_name = user.name
        event.put()
