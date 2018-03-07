# -*- coding: utf-8 -*-
"""Invite User Admin Handler."""

import json
from google.appengine.ext import ndb
from utils import login_required
from utils import json_response
from utils import Utils
from utils import makeUser
from service_entities import enqueue_task
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
            invite.status != 'sent',
            "This invitation has already been processed",
            NotAuthorizedException)
        
        Utils._assert(
            invite.make()['type_of_invite'] != 'INVITE_USER_ADM', 
            "invitation type not allowed", 
            NotAuthorizedException)

        invite.change_status('accepted')
        actual_admin = invite.admin_key.get()
        institution = invite.institution_key.get()

        user.institutions_admin.append(institution.key)
        actual_admin.institutions_admin.remove(institution.key)

        institution.put()
        user.put()
        actual_admin.put()
    
        enqueue_task(
            'transfer-admin-permissions', 
            {
                'institution_key': institution.key.urlsafe(), 
                'user_key': user.key.urlsafe()
            }
        )
        invite.send_response_notification(current_institution=institution.key.urlsafe(), action='ACCEPT')
        self.response.write(json.dumps(makeUser(user, self.request)))

    @json_response
    @login_required
    def delete(self, user, invite_key):  
        invite = ndb.Key(urlsafe=invite_key).get()
        invite.change_status('rejected')
        invite.put()
        invite.send_response_notification(current_institution=invite.institution_key.urlsafe(), action='REJECT')
