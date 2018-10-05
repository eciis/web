# -*- coding: utf-8 -*-
"""Institution Children Collection Request Handler."""

from google.appengine.ext import ndb
import json
from util import login_required
from utils import json_response
from utils import Utils
from custom_exceptions import EntityException
from custom_exceptions import NotAuthorizedException
from . import BaseHandler
from models import Institution
from models import InviteFactory
from models import RequestInstitutionChildren
from service_entities import enqueue_task
from push_notification import NotificationType

__all__ = ['InstitutionChildrenRequestCollectionHandler']

class InstitutionChildrenRequestCollectionHandler(BaseHandler):
    """Institution Children Request Collection Handler."""

    @json_response
    @login_required
    def get(self, user, institution_urlsafe):
        """Get requests for children links."""
        inst_key_obj = ndb.Key(urlsafe=institution_urlsafe)
        queryRequests = RequestInstitutionChildren.query(
            ndb.OR(RequestInstitutionChildren.institution_requested_key == inst_key_obj, RequestInstitutionChildren.institution_key == inst_key_obj),
            RequestInstitutionChildren.status == 'sent'
        )

        requests = [request.make() for request in queryRequests]

        self.response.write(json.dumps(requests))

    @login_required
    @json_response
    def post(self, user, institution_urlsafe):
        """Handler of post requests. This method is called when an
        institution requests to be parent of other institution."""
        user.check_permission(
            'send_link_inst_request',
            'User is not allowed to send request', 
            institution_urlsafe)

        data = json.loads(self.request.body)
        host = self.request.host
        inst_children_request_type = 'REQUEST_INSTITUTION_CHILDREN'

        type_of_invite = data.get('type_of_invite')

        Utils._assert(
            type_of_invite != inst_children_request_type,
            "The type must be REQUEST_INSTITUTION_CHILDREN",
            EntityException
        )

        parent_key = ndb.Key(urlsafe=institution_urlsafe)
        requested_inst_key = data.get('institution_requested_key')
        requested_inst_key = ndb.Key(urlsafe=requested_inst_key)
        
        Utils._assert(
            Institution.has_connection_between(parent_key, requested_inst_key),
            "Circular hierarchy not allowed",
            EntityException
        )

        request = InviteFactory.create(data, type_of_invite)
        request.put()

        institution_parent = parent_key.get()
        institution_parent.add_child(requested_inst_key)

        request.send_invite(host, user.current_institution)

        requested_inst = requested_inst_key.get()
        receiver = requested_inst.admin.urlsafe()
    
        enqueue_task('send-push-notification', {
            'type': NotificationType.link,
            'receivers': [receiver],
            'entity': requested_inst_key.urlsafe()
        })

        self.response.write(json.dumps(request.make()))
