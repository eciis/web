# -*- coding: utf-8 -*-
"""Invite Collection Handler."""

import json

from utils import login_required
from utils import json_response
from utils import Utils
from custom_exceptions.notAuthorizedException import NotAuthorizedException
from handlers.base_handler import BaseHandler
from models.invite_institution import InviteInstitution
from models.factory_invites import InviteFactory
from service_entities import enqueue_task


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
    def post(self, user):
        """Handle POST Requests."""
        body = json.loads(self.request.body)
        data = body['data']
        host = self.request.host
        invites_keys = []
        invite = data['invite_body']
        type_of_invite = invite.get('type_of_invite')
        for email in data['emails']:
            invite['invitee'] = email
            Utils._assert(type_of_invite == 'INSTITUTION',
                          "invitation type not allowed", NotAuthorizedException)

            """TODO: Remove the assert bellow when the hierarchical invitations can be available
            @author: Mayza Nunes 11/01/2018
            """
            Utils._assert(type_of_invite != 'USER',
                          "Hierarchical invitations is not available in this version", NotAuthorizedException)

            current_invite = InviteFactory.create(invite, type_of_invite)

            can_invite_inst = user.has_permission(
                "send_link_inst_invite", current_invite.institution_key.urlsafe())
            can_invite_members = user.has_permission(
                "invite_members", current_invite.institution_key.urlsafe())

            Utils._assert(not can_invite_inst and not can_invite_members,
                          "User is not allowed to send invites", NotAuthorizedException)

            institution = current_invite.institution_key.get()
            Utils._assert(institution.state == 'inactive',
                          "The institution has been deleted", NotAuthorizedException)

            current_invite.put()

            if(current_invite.stub_institution_key):
                current_invite.stub_institution_key.get().addInvite(current_invite)

            invites_keys.append(current_invite.key.urlsafe())

        enqueue_task('send-invite', {'invites_keys': json.dumps(invites_keys), 'host': host,
                                     'current_institution': json.dumps(user.current_institution.urlsafe())})

        self.response.write(json.dumps(
            {'msg': 'Os convites estão sendo processados.'}))
