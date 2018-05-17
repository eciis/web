# -*- coding: utf-8 -*-
"""Invite Handler."""

from google.appengine.ext import ndb
import json

from util.login_service import login_required
from . import BaseHandler
from models import InstitutionProfile
from models import Invite
from custom_exceptions.fieldException import FieldException
from custom_exceptions.notAuthorizedException import NotAuthorizedException
from utils import json_response
from utils import Utils
from util.json_patch import JsonPatch

__all__ = ['InviteHandler']

def define_entity(dictionary):
    """Method of return instance of InstitutionProfile for using in jsonPacth."""
    return InstitutionProfile


def check_if_user_is_member(user, institution):
    """Check if the user is already a member."""
    return institution.has_member(user.key) and user.is_member(institution.key)


class InviteHandler(BaseHandler):
    """Invite Handler."""

    @json_response
    def get(self, key):
        """Get invite of key passed."""
        invite_key = ndb.Key(urlsafe=key)
        invite = Invite.get_by_id(invite_key.id())
        invite = invite.make()

        self.response.write(json.dumps(invite))

    @json_response
    @login_required
    def delete(self, user, key):
        """Change invite status from 'sent' to 'rejected'."""
        invite_key = ndb.Key(urlsafe=key)
        invite = invite_key.get()

        Utils._assert(invite.status != 'sent',
                      "This invitation has already been processed",
                      NotAuthorizedException)

        invite.change_status('rejected')
        invite.put()
        invite.send_response_notification(user.current_institution, user.key, 'REJECT')

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

        Utils._assert(invite.status != 'sent', 
            "This invitation has already been processed", 
            NotAuthorizedException)

        institution_key = invite.institution_key
        institution = institution_key.get()

        Utils._assert(check_if_user_is_member(user, institution), 
            "The user is already a member", NotAuthorizedException)
        
        Utils._assert(not institution.is_active(), 
            "The institution is not active.", NotAuthorizedException)

        invite.change_status('accepted')

        user.add_institution(institution_key)
        user.follow(institution_key)
        user.change_state('active')

        institution.add_member(user)
        institution.follow(user.key)
        JsonPatch.load(data, user, define_entity)

        Utils._assert(
            not InstitutionProfile.is_valid(user.institution_profiles),
            "The profile is invalid.", FieldException
        )
        
        user.put()
        invite.send_response_notification(user.current_institution, user.key, 'ACCEPT')
        
        self.response.write(json.dumps(user.make(self.request)))
