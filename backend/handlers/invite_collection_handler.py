# -*- coding: utf-8 -*-
"""Invite Collection Handler."""

import json

from utils import login_required
from utils import json_response
from utils import Utils
from custom_exceptions.notAuthorizedException import NotAuthorizedException
from . import BaseHandler
from models import InviteInstitution
from models.factory_invites import InviteFactory
from service_entities import enqueue_task
from google.appengine.ext import ndb

__all__ = ['InviteCollectionHandler']

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
        invite = data['invite_body'] if data.get('invite_body') is not None else data
        type_of_invite = invite.get('type_of_invite')

        Utils._assert(type_of_invite == 'INSTITUTION',
                      "invitation type not allowed", NotAuthorizedException)

        institution = ndb.Key(urlsafe=invite['institution_key']).get()
        can_invite_inst = user.has_permission(
            "send_link_inst_invite", institution.key.urlsafe())
        can_invite_members = user.has_permission(
            "invite_members", institution.key.urlsafe())

        Utils._assert(not can_invite_inst and not can_invite_members,
                        "User is not allowed to send invites", NotAuthorizedException)

        Utils._assert(institution.state == 'inactive',
                        "The institution has been deleted", NotAuthorizedException)

        invites = []
        @ndb.transactional(xg=True, retries=10)
        def process_invites(emails, invite, current_institution_key):
            invites_keys = []
            for email in emails:
                invite['invitee'] = email
                current_invite = createInvite(invite)
                invites_keys.append(current_invite.key.urlsafe())
                invites.append({'email': email, 'key': current_invite.key.urlsafe()})

            enqueue_task('send-invite', {'invites_keys': json.dumps(invites_keys), 'host': host,
                                         'current_institution': current_institution_key.urlsafe()})

        if type_of_invite == 'USER':
            process_invites(data['emails'], invite, user.current_institution)
        else:
            invite = createInvite(invite)
            invites.append({'email': invite.invitee, 'key': invite.key.urlsafe()})
            enqueue_task('send-invite', {'invites_keys': json.dumps([invite.key.urlsafe()]), 'host': host,
                                         'current_institution': user.current_institution.urlsafe()})

        self.response.write(json.dumps(
            {'msg': 'The invites are being processed.', 'invites' : invites}))

def createInvite(data):
    """Create an invite."""
    invite = InviteFactory.create(data, data['type_of_invite'])
    invite.put()

    if(invite.stub_institution_key):
        invite.stub_institution_key.get().addInvite(invite)
    
    return invite
