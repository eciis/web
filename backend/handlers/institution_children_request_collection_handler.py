# -*- coding: utf-8 -*-
"""Institution Children Collection Request Handler."""

from google.appengine.ext import ndb
import json
from utils import login_required
from utils import json_response
from utils import Utils
from custom_exceptions.entityException import EntityException
from custom_exceptions.notAuthorizedException import NotAuthorizedException
from . import BaseHandler
from models.institution import Institution
from models.factory_invites import InviteFactory
from models.request_institution_children import RequestInstitutionChildren

__all__ = ['InstitutionChildrenRequestCollectionHandler']

class InstitutionChildrenRequestCollectionHandler(BaseHandler):
    """Request Handler."""

    @json_response
    @login_required
    def get(self, user, institution_key):
        """Get requests for children links."""
        inst_key_obj = ndb.Key(urlsafe=institution_key)
        queryRequests = RequestInstitutionChildren.query(
            ndb.OR(RequestInstitutionChildren.institution_requested_key == inst_key_obj, RequestInstitutionChildren.institution_key == inst_key_obj),
            RequestInstitutionChildren.status == 'sent'
        )

        requests = [request.make() for request in queryRequests]

        self.response.write(json.dumps(requests))

    @login_required
    @json_response
    def post(self, user, institution_key):
        """Handler of post requests."""
        user.check_permission(
            'send_link_inst_request',
            'User is not allowed to send request', 
            institution_key)

        data = json.loads(self.request.body)
        host = self.request.host
        inst_children_request_type = 'REQUEST_INSTITUTION_CHILDREN'

        type_of_invite = data.get('type_of_invite')

        Utils._assert(
            type_of_invite != inst_children_request_type,
            "The type must be REQUEST_INSTITUTION_CHILDREN",
            EntityException
        )

        parent_key = data.get('institution_key')
        parent_key = ndb.Key(urlsafe=parent_key)
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
        institution_parent.children_institutions.append(requested_inst_key)
        institution_parent.put()

        request.send_invite(host, user.current_institution)

        self.response.write(json.dumps(request.make()))
