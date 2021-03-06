# -*- coding: utf-8 -*-
"""Invite User Admin Handler."""

import json
from google.appengine.ext import ndb
from util import login_required
from utils import json_response
from utils import Utils
from service_entities import enqueue_task
from . import BaseHandler
from custom_exceptions import NotAuthorizedException

__all__ = ['InviteUserAdmHandler']

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
            "Invitation type not allowed", 
            NotAuthorizedException)

        actual_admin = invite.admin_key.get()
        institution = invite.institution_key.get()


        @ndb.transactional(xg=True, retries=10)
        def save_changes(user, actual_admin, invite, institution):
            user.add_institution_admin(institution.key)
            actual_admin.remove_institution_admin(institution.key)
            invite.change_status('accepted')
            
            system_notification_id = invite.create_system_notification()
            notification_id = invite.create_accept_response_notification(user.current_institution)

            enqueue_task(
                'transfer-admin-permissions', 
                {
                    'institution_key': institution.key.urlsafe(), 
                    'user_key': user.key.urlsafe(),
                    'notifications_ids': [system_notification_id, notification_id]
                }
            )

        save_changes(user, actual_admin, invite, institution)
        self.response.write(json.dumps(user.make(self.request)))

    @json_response
    @login_required
    def delete(self, user, invite_key):  
        invite = ndb.Key(urlsafe=invite_key).get()
        invite.change_status('rejected')
        invite.put()
        invite.send_reject_response_notification(current_institution=user.current_institution)
