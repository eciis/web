# -*- coding: utf-8 -*-
"""Invite Handler."""

import json

from utils import login_required
from utils import json_response
from handlers.base_handler import BaseHandler
from models.invite import Invite


class InviteCollectionHandler(BaseHandler):
    """Get user's invite."""

    @json_response
    @login_required
    def post(self, user):
        """Handle POST Requests."""
        data = json.loads(self.request.body)

        invite = Invite.create(data)
        invite.put()

        Invite.sendInvite(invite)

        self.response.write(json.dumps(Invite.make(invite)))
