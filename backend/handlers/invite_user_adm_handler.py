# -*- coding: utf-8 -*-
"""Invite User Admin Handler."""

import json
from google.appengine.ext import ndb
from utils import login_required
from utils import json_response
from utils import Utils
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
            invite.status == 'accepted', 
            "This invitation has already been accepted", 
            NotAuthorizedException)

        invite.change_status('accepted')
        actual_admin = invite.admin_key.get()
        institution = invite.institution_key.get()

        institution.admin = user.key
        user.institutions_admin.append(institution.key)
        actual_admin.institutions_admin.remove(institution.key)

        institution.put()
        user.put()
        actual_admin.put()

        enqueue_task(
            'transfer-admin-permissions', 
            {
                'institution_key': institution.keu.urlsafe(), 
                'user_key': user.key.urlsafe()
            }
        )

        self.response.write(json.dumps(invite.make()))



        
