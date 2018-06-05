# -*- coding: utf-8 -*-
"""Invite User Handler."""

from google.appengine.ext import ndb
import json

from util import login_required
from . import BaseHandler
from models import InstitutionProfile
from models import Invite
from custom_exceptions import FieldException
from custom_exceptions import NotAuthorizedException
from utils import json_response
from utils import Utils
from util import JsonPatch

__all__ = ['InviteUserHandler']

def define_entity(dictionary):
    """Method of return instance of InstitutionProfile for using in jsonPacth."""
    return InstitutionProfile


def check_if_user_is_member(user, institution):
    """Check if the user is already a member."""
    return institution.has_member(user.key) and user.is_member(institution.key)


class InviteUserHandler(BaseHandler):
    """Invite User Handler."""

    @json_response
    def get(self, invite_urlsafe):
        """Get the invite whose key is invite_urlsafe."""
        invite_key = ndb.Key(urlsafe=invite_urlsafe)
        invite = Invite.get_by_id(invite_key.id())
        invite = invite.make()

        self.response.write(json.dumps(invite))

    @json_response
    @login_required
    def delete(self, user, invite_urlsafe):
        """Change invite status from 'sent' to 'rejected'.
        This method is called when a user reject an invite
        to be member of an institution.        
        """
        invite_key = ndb.Key(urlsafe=invite_urlsafe)
        invite = invite_key.get()

        Utils._assert(invite.status != 'sent',
                      "This invitation has already been processed",
                      NotAuthorizedException)

        invite.change_status('rejected')
        invite.put()
        invite.send_response_notification(user.current_institution, user.key, 'REJECT')

    @json_response
    @login_required
    @ndb.transactional(xg=True)
    def patch(self, user, invite_key):
        """Handle PATCH Requests.
        This method is called when an user accept
        the invite to be a member of an institution.
        """
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
