# -*- coding: utf-8 -*-
"""User Handler."""

import json

from models.invite import Invite
from utils import Utils
from utils import login_required
from utils import create_user
from utils import json_response
from models.user import InstitutionProfile

from util.json_patch import JsonPatch

from handlers.base_handler import BaseHandler

from google.appengine.ext import ndb


def get_invites(user_email):
    """Query that return list of invites for this user."""
    invites = []

    queryInvites = Invite.query(Invite.invitee.IN(user_email),
                                Invite.status == 'sent')                              

    invites = [invite.make() if invite.institution_key.get().state == "active" else '' for invite in queryInvites]

    return invites


def define_entity(dictionary):
    """Method of return entity class for create object in JasonPacth."""
    return InstitutionProfile


def make_user(user, request):
    """TODO: Move this method to User when utils.py is refactored.

    @author Andre L Abrantes - 20-06-2017
    """
    user_json = Utils.toJson(user, host=request.host)
    user_json['logout'] = 'http://%s/logout?redirect=%s' %\
        (request.host, request.path)
    user_json['institutions'] = []
    for institution in user.institutions:
        user_json['institutions'].append(
            Utils.toJson(institution.get())
        )
    user_json['follows'] = [institution_key.get().make(
        ['name','acronym', 'photo_url', 'key', 'parent_institution'])
        for institution_key in user.follows
        if institution_key.get().state != 'inactive']
    user_json['institution_profiles'] = [profile.make()
        for profile in user.institution_profiles]
    return user_json


def remove_user_from_institutions(user):
    """Remove user from all your institutions."""
    for institution_key in user.institutions:
        institution = institution_key.get()
        institution.remove_member(user)
        institution.unfollow(user.key)


class UserHandler(BaseHandler):
    """User Handler."""

    @json_response
    @login_required
    def get(self, user):
        """Handle GET Requests."""
        """ TODO/FIXME: Remove the user creation from this handler.
            This was done to solve the duplicate user creation bug.
            Author: Ruan Eloy - 18/09/17
        """
        if not user.key:
            user = create_user(user.name, user.email)

        user_json = make_user(user, self.request)
        user_json['invites'] = get_invites(user.email)

        self.response.write(json.dumps(user_json))

    @json_response
    @login_required
    def delete(self, user, institution_key):
        """Handler DELETE Requests."""
        institution_key = ndb.Key(urlsafe=institution_key)
        institution = institution_key.get()

        user.remove_institution(institution_key)

        institution.remove_member(user)
        institution.unfollow(user.key)

    @json_response
    @login_required
    def patch(self, user):
        """Handler PATCH Requests."""
        data = self.request.body
        print data
        """Apply patch."""
        JsonPatch.load(data, user)

        if(user.state == 'inactive'):
            remove_user_from_institutions(user)
            user.disable_account()

        """Update user."""
        user.put()

        self.response.write(json.dumps(make_user(user, self.request)))
