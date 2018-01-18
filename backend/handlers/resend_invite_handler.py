# -*- coding: utf-8 -*-
"""Resend Invite Handler."""

import json

from utils import login_required
from utils import json_response
from utils import Utils
from custom_exceptions.notAuthorizedException import NotAuthorizedException
from handlers.base_handler import BaseHandler
from google.appengine.ext import ndb


class ResendInviteHandler(BaseHandler):
    """Resend Invite Handler."""

    @json_response
    @login_required
    def post(self, user, invite_key):
        """Handle POST Requests."""
        host = self.request.host
        invite = ndb.Key(urlsafe=invite_key).get()
        
        Utils._assert(invite.status != 'sent',
                      "The invite has already been used", NotAuthorizedException)

        can_invite_members = user.has_permission(
            "invite_members", invite.institution_key.urlsafe())

        Utils._assert(not can_invite_members,
            "User is not allowed to send invites", NotAuthorizedException)

        institution = invite.institution_key.get()
        Utils._assert(institution.state == 'inactive',
                        "The institution has been deleted", NotAuthorizedException)

        invite.sendInvite(user, host)
