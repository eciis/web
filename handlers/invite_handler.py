# -*- coding: utf-8 -*-
"""Invite Handler."""

from google.appengine.ext import ndb
import json

from utils import login_required
from handlers.base_handler import BaseHandler
from models.user import InstitutionProfile
from custom_exceptions.fieldException import FieldException
from utils import json_response
from utils import Utils
from util.json_patch import JsonPatch


def makeUser(user, request):
    """Make User."""
    user_json = Utils.toJson(user, host=request.host)
    user_json['logout'] = 'http://%s/logout?redirect=%s' %\
        (request.host, request.path)
    user_json['institutions'] = []
    for institution in user.institutions:
        user_json['institutions'].append(
            Utils.toJson(institution.get())
        )
    user_json['follows'] = [institution_key.get().make(
        ['acronym', 'photo_url', 'key', 'parent_institution']) for institution_key in user.follows]
    return user_json


class InviteHandler(BaseHandler):
    """Invite Handler."""

    @json_response
    @login_required
    def get(self, user, key):
        """Get invite of key passed."""
        invite_key = ndb.Key(urlsafe=key)
        invite = invite_key.get()
        invite = invite.make()

        self.response.write(json.dumps(invite))

    @login_required
    def delete(self, user, key):
        """Change invite status from 'sent' to 'resolved'."""
        invite_key = ndb.Key(urlsafe=key)
        invite = invite_key.get()
        invite.change_status('rejected')
        invite.put()

    @json_response
    @login_required
    def patch(self, user, invite_key):
        """Handler PATCH Requests."""
        data = json.loads(self.request.body)

        invite = ndb.Key(urlsafe=invite_key).get()
        invite.change_status('accepted')

        institution_key = invite.institution_key
        institution = institution_key.get()

        user.add_institution(institution_key)
        user.follow(institution_key)
        user.change_state('active')

        institution.add_member(user)
        institution.follow(user.key)

        JsonPatch.load(data, user, InstitutionProfile)
        Utils._assert(
            not InstitutionProfile.is_valid(user.institution_profiles,
                                            len(user.institutions)),
            "The profile is invalid.", FieldException)
        user.put()

        self.response.write(json.dumps(makeUser(user, self.request)))
