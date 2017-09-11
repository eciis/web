# -*- coding: utf-8 -*-
"""Institution Children Collection Request Handler."""

import json
from utils import login_required
from utils import json_response
from utils import Utils
from custom_exceptions.entityException import EntityException
from handlers.base_handler import BaseHandler
from models.factory_invites import InviteFactory
from models.request_institution_children import RequestInstitutionChildren


class InstitutionChildrenRequestCollectionHandler(BaseHandler):
    """Request Handler."""

    @json_response
    @login_required
    def get(self, user, institution_key):
        """Get requests for children links."""
        queryRequests = RequestInstitutionChildren.query(
            RequestInstitutionChildren.institution_key == ndb.Key(urlsafe=institution_key),
            RequestInstitutionChildren.status == 'sent'
        )

        requests = [request.make() for request in queryRequests]

        self.response.write(json.dumps(requests))

    @login_required
    @json_response
    def post(self, user, institution_key):
        """Handler of post requests."""
        data = json.loads(self.request.body)
        host = self.request.host
        inst_children_request_type = 'REQUEST_INSTITUTION_CHILDREN'

        type_of_invite = data.get('type_of_invite')

        Utils._assert(
            type_of_invite != inst_children_request_type,
            "The type must be REQUEST_INSTITUTION_CHILDREN",
            EntityException
        )

        request = InviteFactory.create(data, type_of_invite)
        request.put()

        parent_institution = request.institution_key.get()
        parent_institution.children_institutions.append(request.institution_requested_key)
        parent_institution.put()

        request.sendInvite(user, host)

        self.response.write(json.dumps(request.make()))
