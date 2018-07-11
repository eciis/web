# -*- coding: utf-8 -*-
"""Invite Institution Handler."""

from google.appengine.ext import ndb
import json

from util import login_required
from . import BaseHandler
from custom_exceptions import NotAuthorizedException
from utils import json_response
from utils import Utils 

__all__ = ['InviteInstitutionHandler']


class InviteInstitutionHandler(BaseHandler):
    """Invite Institution Handler."""

    @json_response
    @login_required
    def delete(self, user, invite_urlsafe):
        """Change invite status from 'sent' to 'rejected'.
        
        This method is called when an user reject a invite
        to create a new institution.
        """
        invite_key = ndb.Key(urlsafe=invite_urlsafe)
        invite = invite_key.get()

        Utils._assert(invite.status != 'sent',
                      "This invitation has already been processed",
                      NotAuthorizedException)

        invite.change_status('rejected')
        invite.put()
        invite.send_reject_response_notification(
            user.current_institution, user.key)

        stub_institution = invite.stub_institution_key.get()
        stub_institution.change_state('inactive')
