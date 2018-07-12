# -*- coding: utf-8 -*-
"""Institution Parent Collectcion Request Handler."""

from google.appengine.ext import ndb
import json
from util import login_required
from utils import json_response
from utils import Utils
from custom_exceptions import EntityException
from . import BaseHandler
from models import Institution
from models import InviteFactory
from models import RequestInstitutionParent
from custom_exceptions import NotAuthorizedException
from util import Notification, NotificationsQueueManager
from service_entities import enqueue_task
from service_messages import create_message


__all__ = ['InstitutionParentRequestCollectionHandler']

def remake_link(request, requested_inst_key, child_institution, user):
    notification_message = create_message(sender_key=user.key,
        current_institution_key=child_institution.key,
        receiver_institution_key=requested_inst_key,
        sender_institution_key=child_institution.key)

    notification = Notification(
        entity_key=child_institution.key.urlsafe(),
        receiver_key=requested_inst_key.get().admin.urlsafe(),
        notification_type='RE_ADD_ADM_PERMISSIONS',
        message=notification_message
    )

    notification_id = NotificationsQueueManager.create_notification_task(notification)
    enqueue_task('add-admin-permissions', {
        'institution_key': child_institution.key.urlsafe(),
        'notifications_ids': [notification_id]
    })

    request.change_status('accepted')

class InstitutionParentRequestCollectionHandler(BaseHandler):
    """Institution Parent Collectcion Request Handler."""

    @json_response
    @login_required
    def get(self, user, institution_urlsafe):
        """Handle GET requests.
        This method returns all the RequestInstitutionParent
        that the institution, whose key's representation is
        institution_urlsafe, is involved either as a child or
        as a parent. 
        """
        inst_key_obj = ndb.Key(urlsafe=institution_urlsafe)
        queryRequests = RequestInstitutionParent.query(
            ndb.OR(RequestInstitutionParent.institution_requested_key == inst_key_obj,
                   RequestInstitutionParent.institution_key == inst_key_obj),
            RequestInstitutionParent.status == 'sent'
        )

        requests = [request.make() for request in queryRequests]

        self.response.write(json.dumps(requests))

    @login_required
    @json_response
    def post(self, user, institution_urlsafe):
        """Handle POST requests.
        It sends a request to the requested_institution
        to be parent of child_inst, whose key representation
        is institution_urlsafe. It can only be done if the user
        has permission to send the request, if the child_institution
        has no parent and if the two institutions are not linked yet.
        """
        user.check_permission(
            'send_link_inst_request',
            'User is not allowed to send request',
            institution_urlsafe)

        data = json.loads(self.request.body)
        host = self.request.host
        inst_parent_request_type = 'REQUEST_INSTITUTION_PARENT'

        type_of_invite = data.get('type_of_invite')

        Utils._assert(
            type_of_invite != inst_parent_request_type,
            "The type must be REQUEST_INSTITUTION_PARENT",
            EntityException
        )

        child_key = ndb.Key(urlsafe=institution_urlsafe)
        requested_inst_key = data.get('institution_requested_key')
        requested_inst_key = ndb.Key(urlsafe=requested_inst_key)

        child_institution = child_key.get()
        Utils._assert(
            child_institution.parent_institution != None,
            "The institution's already have a parent",
            NotAuthorizedException
        )

        Utils._assert(
            Institution.has_connection_between(requested_inst_key, child_key),
            "Circular hierarchy not allowed",
            EntityException
        )

        request = InviteFactory.create(data, type_of_invite)

        @ndb.transactional(retries=10, xg=True)
        def main_operations(request, requested_inst_key, child_institution, user, host):

            child_institution.parent_institution = requested_inst_key
            child_institution.put()

            if child_institution.key in requested_inst_key.get().children_institutions:
                remake_link(request, requested_inst_key, child_institution, user)
            else:
                request.put()
                request.send_invite(host, user.current_institution)

            return request

        request = main_operations(request, requested_inst_key, child_institution, user, host)

        self.response.write(json.dumps(request.make()))
