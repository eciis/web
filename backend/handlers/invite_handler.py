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
from search_user_module import createDocument


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


def define_entity(dictionary):
    """Method of return instance of InstitutionProfile for using in jsonPacth."""
    return InstitutionProfile


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

    @json_response
    @login_required
    def delete(self, user, key):
        """Change invite status from 'sent' to 'rejected'."""
        invite_key = ndb.Key(urlsafe=key)
        invite = invite_key.get()
        invite.change_status('rejected')
        invite.put()
        invite.send_response_notification(user, invite.admin_key.urlsafe(), 'REJECT')

        if invite.stub_institution_key:
            stub_institution = invite.stub_institution_key.get()
            stub_institution.change_state('inactive')

    @json_response
    @login_required
    @ndb.transactional(xg=True)
    def patch(self, user, invite_key):
        """Handler PATCH Requests."""
        data = self.request.body

        invite = ndb.Key(urlsafe=invite_key).get()
        invite.change_status('accepted')

        institution_key = invite.institution_key
        institution = institution_key.get()

        user.add_institution(institution_key)
        user.follow(institution_key)
        user.change_state('active')
        createDocument(user)

        institution.add_member(user)
        institution.follow(user.key)

        JsonPatch.load(data, user, define_entity)

        invite.send_response_notification(user, invite.admin_key.urlsafe(), 'ACCEPT')
        # TODO: Change the method is valid to check only
        # the new institution profile of this patch
        # @author: Mayza Nunes 19/09/2017
        Utils._assert(
            not InstitutionProfile.is_valid(user.institution_profiles),
            "The profile is invalid.", FieldException)
        user.put()

        self.response.write(json.dumps(makeUser(user, self.request)))
