# -*- coding: utf-8 -*-
"""Institution Parent Collectcion Request Handler."""

import json
from utils import login_required
from utils import json_response
from utils import is_admin
from utils import Utils
from custom_exceptions.entityException import EntityException
from handlers.base_handler import BaseHandler
from models.factory_invites import InviteFactory
from models.request_institution_parent import RequestInstitutionParent


class InstitutionParentRequestCollectionHandler(BaseHandler):
    """Institution Parent Collectcion Request Handler."""

    @json_response
    @login_required
    def get(self, user, institution_key):
        """Get requests for parent links."""
        queryRequests = RequestInstitutionParent.query(
            RequestInstitutionParent.institution_key == ndb.Key(urlsafe=institution_key),
            RequestInstitutionParent.status == 'sent'
        )

        requests = [request.make() for request in queryRequests]

        self.response.write(json.dumps(requests))

    @login_required
    @json_response
    @is_admin
    def post(self, user, institution_key):
        """Handler of post requests."""
        data = json.loads(self.request.body)
        host = self.request.host
        inst_parent_request_type = 'REQUEST_INSTITUTION_PARENT'

        type_of_invite = data.get('type_of_invite')

        Utils._assert(
            type_of_invite != inst_parent_request_type,
            "The type must be REQUEST_INSTITUTION_PARENT",
            EntityException
        )

        request = InviteFactory.create(data, type_of_invite)
        request.put()

        institution_children = request.institution_key.get()
        institution_children.parent_institution = request.institution_requested_key
        institution_children.put()

        request.sendInvite(user, host)

        self.response.write(json.dumps(request.make()))
