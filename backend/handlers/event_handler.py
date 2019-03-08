# -*- coding: utf-8 -*-
"""Event Handler."""
import json
from google.appengine.ext import ndb

from models import Event
from utils import Utils
from util import login_required
from utils import NotAuthorizedException
from utils import json_response
from util import JsonPatch
from . import BaseHandler
from service_entities import enqueue_task

__all__ = ['EventHandler']

class EventHandler(BaseHandler):
    """Event Handler."""

    @json_response
    @login_required
    def get(self, user, event_urlsafe):
        """Handle GET Requests.
        Get specific event, whose key is event_urlsafe,
        if it is not deleted. 
        """
        event_key = ndb.Key(urlsafe=event_urlsafe)
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
    def delete(self, user, event_urlsafe):
        """Change event's state from 'published' to 'deleted'
        if the user has permission to.
        """
        event_key = ndb.Key(urlsafe=event_urlsafe)
        event = event_key.get()

        is_admin = user.has_permission("remove_posts", event.institution_key.urlsafe())
        is_author = user.has_permission("remove_post", event.key.urlsafe())

        Utils._assert(not is_admin and not is_author,
                      "The user can not remove this event", NotAuthorizedException)

        event.state = 'deleted'
        event.last_modified_by = user.key
        event.last_modified_by_name = user.name
        event.put()

        params = {
                'receiver_key': event.author_key.urlsafe(),
                'sender_key': user.key.urlsafe(),
                'entity_key': event.key.urlsafe(),
                'entity_type': 'DELETED_EVENT',
                'current_institution': user.current_institution.urlsafe(),
                'sender_institution_key': event.institution_key.urlsafe(),
                'field': 'followers',
                'title': event.title
            }

        enqueue_task('multiple-notification', params)

    @json_response
    @login_required
    def patch(self, user, event_urlsafe):
        """Handle PATCH Requests.
        To edit an event some conditions gotta be satisfied:
        The user gotta have the permission, the event can't be
        deleted and the operations gotta be valid.
        """
        patch = self.request.body

        event = ndb.Key(urlsafe=event_urlsafe).get()

        user.check_permission('edit_post',
            "The user can not edit this event",
            event_urlsafe)

        Utils._assert(event.state == 'deleted',
                      "The event has been deleted.", NotAuthorizedException)

        event.verify_patch(patch)

        """Apply patch."""
        JsonPatch.load(patch, event)

        is_patch = True
        event.isValid(is_patch)

        """Update event."""
        event.put()

        params = {
                'receiver_key': event.author_key.urlsafe(),
                'sender_key': user.key.urlsafe(),
                'entity_key': event.key.urlsafe(),
                'entity_type': 'UPDATED_EVENT',
                'current_institution': user.current_institution.urlsafe(),
                'sender_institution_key': event.institution_key.urlsafe(),
                'field': 'followers',
                'title': event.title
            }

        enqueue_task('multiple-notification', params)
