# -*- coding: utf-8 -*-
"""Invite Collection Handler."""

import json

from utils import login_required
from utils import json_response
from utils import is_admin
from utils import Utils
from custom_exceptions.notAuthorizedException import NotAuthorizedException
from handlers.base_handler import BaseHandler
from models.invite_institution import InviteInstitution
from models.factory_invites import InviteFactory


class InviteCollectionHandler(BaseHandler):
    """Invite Collection Handler."""

    @json_response
    @login_required
    def get(self, user):
        """Get invites for new institutions make by Plataform."""
        invites = []

        queryInvites = InviteInstitution.query()

        invites = [invite.make() for invite in queryInvites]

        self.response.write(json.dumps(invites))

    @json_response
    @login_required
    @is_admin
    def post(self, user):
        """Handle POST Requests."""
        data = json.loads(self.request.body)
        host = self.request.host

        type_of_invite = data.get('type_of_invite')
        invite = InviteFactory.create(data, type_of_invite)

        institution = invite.institution_key.get()
        Utils._assert(institution.state == 'inactive',
                      "The institution has been deleted", NotAuthorizedException)

        invite.put()

        if(invite.stub_institution_key):
            invite.stub_institution_key.get().addInvite(invite)

        invite.sendInvite(user, host)

        make_invite = invite.make()

        self.response.write(json.dumps(make_invite))
