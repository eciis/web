# -*- coding: utf-8 -*-
"""User Handler."""

import json

from models import Invite, RequestUser
from utils import Utils
from util import login_required
from models import User
from utils import json_response
from models import InstitutionProfile
from service_messages import send_message_notification
from util import JsonPatch
from service_entities import enqueue_task

from . import BaseHandler

from google.appengine.ext import ndb

__all__ = ['UserHandler']

def get_invites(user_email):
    """Query that return list of invites for this user."""
    invites = []

    queryInvites = Invite.query(Invite.invitee.IN(user_email),
                                Invite.status == 'sent')                              

    invites = [invite.make() if invite.institution_key.get().state == "active" else '' for invite in queryInvites]

    return invites

def get_requests(user_key):
    """Query to return the list of requests that this user sent to institutions."""
    institutions_requested = []
    queryRequests = RequestUser.query(RequestUser.sender_key == user_key, RequestUser.status == 'sent')
    institutions_requested = [request.institution_key.urlsafe() for request in queryRequests]

    return institutions_requested

def define_entity(dictionary):
    """Method of return entity class for create object in JasonPacth."""
    return InstitutionProfile

def remove_user_from_institutions(user):
    """Remove user from all your institutions."""
    for i in range(len(user.institutions) -1, -1, -1):
        institution_key = user.institutions[i]
        institution = institution_key.get()
        institution.remove_member(user)

def notify_admins(user):
    """Notify the admins about the user removal."""
    for institution_key in user.institutions:
        admin_key = institution_key.get().admin
        notification_message = user.create_notification_message(
            user.key, institution_key)
        send_message_notification(
            receiver_key=admin_key.urlsafe(),
            notification_type='DELETED_USER',
            entity_key=institution_key.urlsafe(),
            message=notification_message
        )

        enqueue_task('send-push-notification', {
            'receivers': [admin_key.urlsafe()],
            'type': 'DELETED_USER',
            'entity': user.key.urlsafe()
        })


class UserHandler(BaseHandler):
    """User Handler."""

    @json_response
    @login_required
    def get(self, user):
        """Handle GET Requests."""
        """ TODO/FIXME: Remove the user creation from this handler.
            This was done to solve the duplicate user creation bug.
            Author: Ruan Eloy - 18/09/17
        """
        if not user.key:
            user = User.create(user.name, user.email)

        user_json = user.make(self.request)
        user_json['invites'] = get_invites(user.email)
        user_json['institutions_requested'] = get_requests(user.key)

        self.response.write(json.dumps(user_json))

    @json_response
    @login_required
    def delete(self, user):
        """Handle DELETE Requests.
        
        This method is responsible to handle the account deletion operation,
        once in this operation the user is going to be deleted.
        """
        user.state = 'inactive'

        notify_admins(user)
        remove_user_from_institutions(user)
        user.disable_account()

        user.put()

    @json_response
    @login_required
    def patch(self, user):
        """Handle PATCH Requests.
        
        This method is only responsible for update user data.
        Thus, edition requests comes to here.
        """
        data = self.request.body

        """Apply patch."""
        JsonPatch.load(data, user)

        """Update user."""
        user.put()

        self.response.write(json.dumps(user.make(self.request)))
