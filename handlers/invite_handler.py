# -*- coding: utf-8 -*-
"""Invite Handler."""

from google.appengine.ext import ndb

from utils import login_required
from handlers.base_handler import BaseHandler
from utils import json_response
from utils import Utils
from util.json_patch import JsonPatch


class InviteHandler(BaseHandler):
    """Invite Handler."""

    @login_required
    def delete(self, user, key):
        """Change invite status from 'sent' to 'resolved'."""
        invite_key = ndb.Key(urlsafe=key)
        invite = invite_key.get()
        invite.status = 'rejected'
        invite.put()

    @json_response
    @login_required
    def patch(self, user, url_string):
        """Handler PATCH Requests."""
        data = self.request.body
        try:
            invite = ndb.Key(urlsafe=url_string).get()

            """Apply patch."""
            JsonPatch.load(data, invite)

            """Update invite."""
            invite.put()
        except Exception as error:
            self.response.set_status(Utils.BAD_REQUEST)
            self.response.write(Utils.getJSONError(
                Utils.BAD_REQUEST, error.message))
