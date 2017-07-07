# -*- coding: utf-8 -*-
"""Invite Handler."""

import json
from google.appengine.ext import ndb

from utils import login_required
from utils import json_response
from utils import Utils
from custom_exceptions.notAuthorizedException import NotAuthorizedException
from handlers.base_handler import BaseHandler
from models.invite import Invite


class InviteCollectionHandler(BaseHandler):
    """Get user's invite."""

    def is_admin(method):
        """Check if the user is admin of the institution."""
        def check_authorization(self, user, *args):
            data = json.loads(self.request.body)
            institution_key = ndb.Key(urlsafe=data['institution_key'])
            institution = institution_key.get()

            Utils._assert(institution.key not in user.institutions_admin or institution.admin != user.key,
                          'User is not administrator', NotAuthorizedException)

            method(self, user, *args)
        return check_authorization

    @json_response
    @login_required
    @is_admin
    def post(self, user):
        """Handle POST Requests."""
        data = json.loads(self.request.body)

        invite = Invite.create(data)
        invite.put()

        Invite.sendInvite(invite)

        self.response.write(json.dumps(Invite.make(invite)))
