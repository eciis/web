# -*- coding: utf-8 -*-
"""Invite User Admin Handler."""

from google.appengine.ext import ndb
from utils import login_required
from utils import json_response
from utils import Utils
from handlers.base_handler import BaseHandler
from custom_exceptions.notAuthorizedException import NotAuthorizedException



class InviteUserAdmHandler(BaseHandler):
    """Invite User Admin Handler."""

    @json_response
    @login_required
    def put(self, user, invite_key):
        """Handler of accept invite."""
        invite = ndb.Key(urlsafe=invite_key).get()

        Utils._assert(
            invite.status == 'accepted', 
            "This invitation has already been accepted", 
            NotAuthorizedException)

        actual_admin = invite.admin_key.get()
        user

        institution = invite.institution_key.get()
        institution.admin = user.key



        
