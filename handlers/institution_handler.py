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
                                Invite.status == 'sent')

    invites = [invite.make() for invite in queryInvites]

    return invites


def isUserInvited(method):
    """Check if the user is invitee to update the stub of institution."""
    def check_authorization(self, user, institution_key, inviteKey=None):
        if inviteKey:
            invite = ndb.Key(urlsafe=inviteKey).get()

            emailIsNotInvited = invite.invitee != user.email
            institutionIsNotInvited = ndb.Key(
                urlsafe=institution_key) != invite.stub_institution_key

            Utils._assert(emailIsNotInvited or institutionIsNotInvited,
                          'User is not invitee to create this Institution',
                          NotAuthorizedException)

        method(self, user, institution_key, inviteKey)
    return check_authorization


def is_admin(user, institution_key):
    """Check if the user is admin of institution."""
    institution = ndb.Key(urlsafe=institution_key).get()
    return institution.admin == user.key


def childrenToJson(obj):
    """Return the array with json from institution that are obj children."""
    json = [Utils.toJson(institution.get())
            for institution in obj.children_institutions]
    return json


def parentToJson(obj):
    """Return json whith parent institution."""
    if(obj.parent_institution):
        return Utils.toJson(obj.parent_institution.get())


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

    @json_response
    @login_required
    @isUserInvited
    def patch(self, user, institution_key, inviteKey=None):
        """Handler PATCH Requests."""
        data = self.request.body

        institution = ndb.Key(urlsafe=institution_key).get()

        if inviteKey:
            """Apply patch."""
            JsonPatch.load(data, institution)
            institution.createInstitutionWithStub(user, inviteKey, institution)

            search_module.createDocument(
                institution.key.urlsafe(), institution.name, institution.state,
                institution.admin.get().email)
        else:
            if is_admin(user, institution_key):
                JsonPatch.load(data, institution)
                institution.put()
                data = json.loads(data)
                search_module.updateDocument(
                    data, institution.key.urlsafe(), institution.name,
                    institution.state, institution.admin.get().email)

        institution_json = Utils.toJson(institution)

        self.response.write(json.dumps(
            institution_json))
