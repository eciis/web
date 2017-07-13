# -*- coding: utf-8 -*-
"""Invite Handler."""

from google.appengine.ext import ndb

from utils import login_required
from handlers.base_handler import BaseHandler


class InviteHandler(BaseHandler):
    """Invite Handler."""

    @login_required
    def delete(self, user, key):
        """Change invite status from 'sent' to 'resolved'."""
        invite_key = ndb.Key(urlsafe=key)
        invite = invite_key.get()
        invite.status = 'resolved'
        invite.put()
