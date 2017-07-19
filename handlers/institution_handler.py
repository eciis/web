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

    queryInvites = Invite.query(Invite.institution_key == institution_key)

    invites = [Invite.make(invite) for invite in queryInvites]

    return invites


def childrenToJson(obj):
    """Return the array with json from institution that are obj children."""
    json = []
    for institution in obj.children_institutions:
        json.append(
            Utils.toJson(institution.get())
        )
    return json


def parentToJson(obj):
    """Return json whith parent institution."""
    if(obj.parent_institution):
        return Utils.toJson(obj.parent_institution.get())
    else:
        None


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
        institution_json['parent_institution'] = parentToJson(obj)
        institution_json['children_institutions'] = childrenToJson(obj)

        self.response.write(json.dumps(
            institution_json
        ))
