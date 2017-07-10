# -*- coding: utf-8 -*-
"""Institution Handler."""

import json

from google.appengine.ext import ndb

from utils import Utils
from models.invite import Invite
from utils import login_required
from utils import json_response

from models.institution import Institution

from handlers.base_handler import BaseHandler


def getSentInvitations(institution_key):
    """Query that return list of invites for this user."""
    invites = []

    queryInvites = Invite.query(Invite.institution_key == institution_key,
                                Invite.type_of_invite == 'user')

    invites = [Invite.make(invite) for invite in queryInvites]

    return invites


class InstitutionHandler(BaseHandler):
    """Institution Handler."""

    @json_response
    @login_required
    def get(self, user, url_string):
        """Handle GET Requests."""
        obj_key = ndb.Key(urlsafe=url_string)
        obj = obj_key.get()
        assert type(obj) is Institution, "Key is not an Institution"
        institution_json = Utils.toJson(obj, host=self.request.host)
        institution_json['sent_invitations'] = getSentInvitations(obj.key)
        self.response.write(json.dumps(
            institution_json
        ))
