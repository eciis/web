# -*- coding: utf-8 -*-
"""Event Followers Handler."""
import json
from google.appengine.ext import ndb

from models import Event
from utils import Utils
from util import login_required
from utils import NotAuthorizedException
from utils import json_response
from . import BaseHandler

__all__ = ['EventFollowersHandler']

class EventFollowersHandler(BaseHandler):
    """Event Followers Handler."""

    @json_response
    @login_required
    def post(self, user, event_urlsafe):
        """."""
        event = ndb.Key(urlsafe=event_urlsafe).get()

        Utils._assert(event.state != 'published',
                      'The event is not published',
                      NotAuthorizedException)

        event.add_follower(user)

    @json_response
    @login_required
    def delete(self, user, event_urlsafe):
        """."""
        event = ndb.Key(urlsafe=event_urlsafe).get()

        Utils._assert(event.state != 'published',
                      'The event is not published',
                      NotAuthorizedException)

        event.remove_follower(user)