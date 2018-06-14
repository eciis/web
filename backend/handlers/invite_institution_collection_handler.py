# -*- coding: utf-8 -*-
"""Invite Institution Handler."""

import json

from util import login_required
from utils import json_response
from utils import Utils
from custom_exceptions import NotAuthorizedException
from . import BaseHandler
from models import InviteFactory
from models import InviteInstitution

__all__ = ['InviteInstitutionCollectionHandler']

class InviteInstitutionCollectionHandler(BaseHandler):
    """Invite Institution Collection Handler."""

    @json_response
    @login_required
    def get(self, user):
        """Get all invite whose type is institution."""
        invites = []

        queryInvites = InviteInstitution.query()

        invites = [invite.make() for invite in queryInvites]

        self.response.write(json.dumps(invites))

    @json_response
    @login_required
    def post(self, user):
        """Handle POST Requests.
        
        Creates a stub_institution, an institution with
        a pending state. It is made from the invite's data
        and can be accepted later.
        It is allowed only if the institution that sent the invite
        is not inactive and if the user has permission to send this
        kind of invite.
        """
        body = json.loads(self.request.body)
        data = body['data']
        host = self.request.host
        type_of_invite = data.get('type_of_invite')

        Utils._assert(type_of_invite != 'INSTITUTION',
                      "invitation type not allowed", NotAuthorizedException)

        invite = InviteFactory.create(data, type_of_invite)
        institution = invite.institution_key.get()
    
        user.check_permission(
            'send_invite_inst',
            'User is not allowed to post invite', 
            institution.key.urlsafe()
        )

        Utils._assert(not institution.is_active(),
                      "This institution is not active", NotAuthorizedException)

        invite.put()
        invite.stub_institution_key.get().addInvite(invite)

        invite.send_invite(host, user.current_institution)

        make_invite = invite.make()

        self.response.write(json.dumps(make_invite))
