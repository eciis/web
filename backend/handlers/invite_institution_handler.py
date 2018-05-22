# -*- coding: utf-8 -*-
"""Invite Institution Handler."""

import json

from util import login_required
from utils import json_response
from utils import Utils
from custom_exceptions import NotAuthorizedException
from . import BaseHandler
from models import InviteFactory

__all__ = ['InviteInstitutionHandler']

class InviteInstitutionHandler(BaseHandler):
    """Invite Institution Handler."""

    @json_response
    @login_required
    def post(self, user):
        """Handle POST Requests."""
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

        Utils._assert(institution.state == 'inactive',
                      "The institution has been deleted", NotAuthorizedException)

        invite.put()
        if(invite.stub_institution_key):
            invite.stub_institution_key.get().addInvite(invite)

        invite.send_invite(host, user.current_institution)

        make_invite = invite.make()

        self.response.write(json.dumps(make_invite))
