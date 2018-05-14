# -*- coding: utf-8 -*-
"""Event Handler."""
import json
from google.appengine.ext import ndb

from models import Event
from utils import Utils
from utils import login_required
from utils import NotAuthorizedException
from utils import json_response
from util.json_patch import JsonPatch
from . import BaseHandler

__all__ = ['EventHandler']

class EventHandler(BaseHandler):
    """Event Handler."""

    @json_response
    @login_required
    def get(self, user, url_string):
        """Handle GET Requests."""
        event_key = ndb.Key(urlsafe=url_string)
        event = event_key.get()

        Utils._assert(event.state == 'deleted', 
            "The event has been deleted.", NotAuthorizedException)

        assert type(event) is Event, "Key is not an Event"
        event_json = Event.make(event)

        self.response.write(json.dumps(
            event_json
        ))

    @json_response
    @login_required
    def delete(self, user, key):
        """Change event state from 'published' to 'deleted'."""
        event_key = ndb.Key(urlsafe=key)
        event = event_key.get()

        is_admin = user.has_permission("remove_posts", event.institution_key.urlsafe())
        is_author = user.has_permission("remove_post", event.key.urlsafe())

        Utils._assert(not is_admin and not is_author,
                      "The user can not remove this event", NotAuthorizedException)

        event.state = 'deleted'
        event.last_modified_by = user.key
        event.last_modified_by_name = user.name
        event.put()

    @json_response
    @login_required
    def patch(self, user, key):
        """Handler PATCH Requests."""
        patch = self.request.body

        event = ndb.Key(urlsafe=key).get()

        user.check_permission('edit_post',
            "The user can not edit this event",
            key)

        Utils._assert(event.state == 'deleted',
                      "The event has been deleted.", NotAuthorizedException)

        event.verify_patch(patch)

        """Apply patch."""
        JsonPatch.load(patch, event)

        is_patch = True
        event.isValid(is_patch)

        """Update event."""
        event.put()
