# -*- coding: utf-8 -*-
"""Invite User Collection Handler."""

import re
import json
from google.appengine.ext import ndb
from . import BaseHandler
from util import login_required
from utils import json_response, Utils
from custom_exceptions import NotAuthorizedException
from models import InviteFactory
from service_entities import enqueue_task

__all__ = ['InviteUserCollectionHandler']

class InviteUserCollectionHandler(BaseHandler):
    
    @login_required
    @json_response
    def post(self, user):
        """Handle POST invites.
        
        This method creates invites for: 
        new institution administrators 
        and new members of the institution.
        """
        body = json.loads(self.request.body)
        data = body['data']
        host = self.request.host
        invite = data['invite_body']
        type_of_invite = invite.get('type_of_invite')

        # This pattern checks whether the invitation type is USER or USER_ADM
        invite_pattern = re.compile('^USER(_ADM$|$)')
        Utils._assert(
            not invite_pattern.match(type_of_invite),
            "invitation type not allowed", 
            NotAuthorizedException
        )

        institution = ndb.Key(urlsafe=invite['institution_key']).get()
        can_invite_members = user.has_permission(
            "invite_members", institution.key.urlsafe())

        Utils._assert(not can_invite_members,
                        "User is not allowed to send invites", NotAuthorizedException)

        invites = []
        @ndb.transactional(xg=True, retries=10)
        def process_invites(emails, invite, current_institution_key):
            """
            This method creates and sends an invitation 
            to be a member of the institution to all incoming 
            emails per parameter.

            Params:
            emails -- Emails of the users to be invited.
            invite -- Data of the invitation to be created.
            current_institution_key -- Institution in which the administrator was when he sent the invitation.
            """
            current_invite = {}
            invites_keys = []
            for email in emails:
                invite['invitee'] = email
                current_invite = createInvite(invite)
                invites_keys.append(current_invite.key.urlsafe())
                invites.append({'email': email, 'key': current_invite.key.urlsafe()})

            current_invite = current_invite or createInvite(invite)
            notification_id = current_invite.create_sent_invites_notification(current_institution_key)

            enqueue_task(
                'send-invite', 
                {
                    'invites_keys': json.dumps(invites_keys),
                    'host': host,
                    'current_institution': current_institution_key.urlsafe(),
                    'notifications_ids': [notification_id],
                    'type_of_invite': type_of_invite
                }
            )

        # If the invitation was USER type, more than one invitation can be sent at the same time.
        if type_of_invite == 'USER':
            process_invites(data['emails'], invite, user.current_institution)
        else:
            invite = createInvite(invite)
            invites.append({'email': invite.invitee, 'key': invite.key.urlsafe()})
            enqueue_task('send-invite', {
                'invites_keys': json.dumps([invite.key.urlsafe()]), 
                'host': host,
                'current_institution': user.current_institution.urlsafe(), 
                'type_of_invite': type_of_invite
            })

        self.response.write(json.dumps(
            {'msg': 'The invites are being processed.', 'invites' : invites}))


def createInvite(data):
    """Create an invite."""
    invite = InviteFactory.create(data, data['type_of_invite'])
    invite.put()
    
    return invite
