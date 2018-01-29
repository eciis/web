# -*- coding: utf-8 -*-
"""Institution Children Collection Request Handler."""

from google.appengine.ext import ndb
import json
from utils import login_required
from utils import json_response
from utils import Utils
from custom_exceptions.entityException import EntityException
from custom_exceptions.notAuthorizedException import NotAuthorizedException
from handlers.base_handler import BaseHandler
from models.factory_invites import InviteFactory
from models.request_institution_children import RequestInstitutionChildren


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

        body = json.loads(self.request.body)
        data = body['data']
        current_institution = body['currentInstitution']
        host = self.request.host
        inst_children_request_type = 'REQUEST_INSTITUTION_CHILDREN'

        type_of_invite = data.get('type_of_invite')

        """TODO: Remove the assert bellow when the hierarchical requests can be available
        @author: Mayza Nunes 11/01/2018
        """
        Utils._assert(type_of_invite == 'REQUEST_INSTITUTION_CHILDREN',
                      "Hierarchical requests is not available in this version", NotAuthorizedException)

        Utils._assert(
            type_of_invite != inst_children_request_type,
            "The type must be REQUEST_INSTITUTION_CHILDREN",
            EntityException
        )

        request = InviteFactory.create(data, type_of_invite)
        request.put()

        request.send_invite(host, current_institution)

        self.response.write(json.dumps(request.make()))
