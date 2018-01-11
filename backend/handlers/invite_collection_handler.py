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
        data = json.loads(self.request.body)
        host = self.request.host

        type_of_invite = data.get('type_of_invite')

        Utils._assert(type_of_invite == 'INSTITUTION',
                      "invitation type not allowed", NotAuthorizedException)
        
        """TODO: Remove the assert bellow when the hierarchical invitations can be avaiable
        @author: Mayza Nunes 11/01/2018
        """
        Utils._assert(type_of_invite != 'USER',
                      "Hierarchical invitations is not avaiable on test version", NotAuthorizedException)

        invite = InviteFactory.create(data, type_of_invite)

        can_invite_inst = user.has_permission("send_link_inst_invite", invite.institution_key.urlsafe())
        can_invite_members = user.has_permission("invite_members", invite.institution_key.urlsafe())
    
        if(can_invite_inst or can_invite_members):
            institution = invite.institution_key.get()
            Utils._assert(institution.state == 'inactive',
                        "The institution has been deleted", NotAuthorizedException)
            
            invite.put()

            if(invite.stub_institution_key):
                invite.stub_institution_key.get().addInvite(invite)

            invite.sendInvite(user, host)

            make_invite = invite.make()

            self.response.write(json.dumps(make_invite)) 
        else:
            raise NotAuthorizedException("User is not allowed to send invites")
