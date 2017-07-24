# -*- coding: utf-8 -*-
"""Institution Handler."""

import json
import search_module

from google.appengine.ext import ndb

from utils import Utils
from models.invite import Invite
from utils import login_required
from utils import json_response
from custom_exceptions.notAuthorizedException import NotAuthorizedException

from models.institution import Institution
from util.json_patch import JsonPatch


from handlers.base_handler import BaseHandler


def getSentInvitations(institution_key):
    """Query that return list of invites for this user."""
    invites = []

    queryInvites = Invite.query(Invite.institution_key == institution_key,
                                Invite.type_of_invite == 'user',
                                Invite.status == 'sent')

    invites = [Invite.make(invite) for invite in queryInvites]

    return invites


def isUserInvited(method):
    """Check if the user is invitee to update the stub of institution."""
    def check_authorization(self, user, institution_key, inviteKey):
        invite = ndb.Key(urlsafe=inviteKey).get()

        emailIsNotInvited = invite.invitee != user.email
        institutionIsNotInvited = ndb.Key(urlsafe=institution_key) != invite.stub_institution_key

        Utils._assert(emailIsNotInvited or institutionIsNotInvited,
                      'User is not invitee to create this Institution', NotAuthorizedException)

        method(self, user, institution_key, inviteKey)
    return check_authorization


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

    @json_response
    @login_required
    @isUserInvited
    def patch(self, user, institution_key, inviteKey):
        """Handler PATCH Requests."""
        data = self.request.body

        institution = ndb.Key(urlsafe=institution_key).get()

        """Apply patch."""
        JsonPatch.load(data, institution)
        institution.update(user, inviteKey, institution)

        search_module.createDocument(
            institution.key.urlsafe(), institution.name, institution.state)

        institution_json = Utils.toJson(institution)

        self.response.write(json.dumps(
            institution_json))
