# -*- coding: utf-8 -*-
"""Resend Invite Handler."""
import json

from util import login_required
from utils import json_response
from utils import Utils
from custom_exceptions import NotAuthorizedException
from . import BaseHandler
from google.appengine.ext import ndb

__all__ = ['ResendInviteHandler']

class ResendInviteHandler(BaseHandler):
    """Resend Invite Handler."""

    @json_response
    @login_required
    def post(self, user, invite_key):
        """Handle POST Requests."""
        body = json.loads(self.request.body)
        host = self.request.host
        invite = ndb.Key(urlsafe=invite_key).get()
        
        Utils._assert(invite.status != 'sent',
                      "The invite has already been used", NotAuthorizedException)

        user.check_permission("invite_members",
                "User is not allowed to send invites",
                invite.institution_key.urlsafe())

        institution = invite.institution_key.get()
        Utils._assert(not institution.is_active(),
                      "This institution is not active", NotAuthorizedException)

        invite.send_invite(host, user.current_institution)
