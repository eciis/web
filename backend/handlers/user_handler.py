# -*- coding: utf-8 -*-
"""User Handler."""

import json

from models.invite import Invite
from utils import Utils
from utils import login_required
from utils import create_user
from utils import json_response
from utils import make_user
from models import InstitutionProfile

from util.json_patch import JsonPatch

from . import BaseHandler

from google.appengine.ext import ndb

__all__ = ['UserHandler']

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
    def delete(self, user):
        """Handle DELETE Requests.
        
        This method is responsible to handle the account deletion operation,
        once in this operation the user is going to be deleted.
        """
        user.state = 'inactive'

        remove_user_from_institutions(user)
        user.disable_account()

        user.put()

    @json_response
    @login_required
    def patch(self, user):
        """Handle PATCH Requests.
        
        This method is only responsible for update user data.
        Thus, edition requests comes to here.
        """
        data = self.request.body

        """Apply patch."""
        JsonPatch.load(data, user)

        """Update user."""
        user.put()

        self.response.write(json.dumps(make_user(user, self.request)))
