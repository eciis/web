# -*- coding: utf-8 -*-
"""Event Handler."""

from google.appengine.ext import ndb

from utils import Utils
from utils import login_required
from utils import NotAuthorizedException
from utils import json_response
from util.json_patch import JsonPatch
from handlers.base_handler import BaseHandler
import datetime
import json

def is_event_author(method):
    """Check if the user is the author of the event."""

    def check_authorization(self, user, url_string, *args):
        obj_key = ndb.Key(urlsafe=url_string)
        event = obj_key.get()
        Utils._assert(event.author_key != user.key,
                      'User is not allowed to edit this post',
                      NotAuthorizedException)
        method(self, user, url_string, *args)
    return check_authorization


# TODO: Remove this method and treat this in JsonPatch
# @author: Maiana Brito
def treats_date(event, data):
    """Changes the date attributes in the event and removes these operations from the data."""
    data = json.loads(data)

    for i in range(len(data) - 1, -1, -1):
        operation = data[i]
        attribute = operation["path"][1:]
        if attribute == "start_time" or attribute == "end_time":
            value = datetime.datetime.strptime(operation["value"], "%Y-%m-%dT%H:%M:%S")
            event.__setattr__(attribute, value)
            data.remove(operation)

    return json.dumps(data)


class EventHandler(BaseHandler):
    """Event Handler."""

    @login_required
    def delete(self, user, key):
        """Change event state from 'published' to 'deleted'."""
        event_key = ndb.Key(urlsafe=key)
        event = event_key.get()
        event.state = 'deleted'
        event.put()

    @json_response
    @login_required
    @is_event_author
    def patch(self, user, key):
        """Handler PATCH Requests."""
        data = self.request.body

        try:
            event = ndb.Key(urlsafe=key).get()

            """Apply patch."""
            data = treats_date(event, data)
            JsonPatch.load(data, event)

            event.isValid()

            """Update event."""
            event.put()
        except Exception as error:
            self.response.set_status(Utils.FORBIDDEN)
            self.response.write(Utils.getJSONError(
                Utils.FORBIDDEN, error.message))
