# -*- coding: utf-8 -*-
"""Institution Collection Request Handler."""

import json
from utils import login_required
from utils import json_response
from utils import Utils
from custom_exceptions.entityException import EntityException
from handlers.base_handler import BaseHandler
from models.institution import Institution
from models.institution import Address
from models.factory_invites import InviteFactory
from models.request_institution import RequestInstitution
from utils import has_analyze_request_permission


def createInstitution(user, data):
    """Cretate a new institution stub."""
    inst_stub = Institution()

    for property in data:
        if property != 'admin':
            setattr(inst_stub, property, data[property])

    inst_stub.address = Address.create(data.get('address'))
    inst_stub.state = 'pending'
    inst_stub.put()

    return inst_stub


class InstitutionRequestCollectionHandler(BaseHandler):
    """Institution Request Handler."""

    @json_response
    @login_required
    @has_analyze_request_permission
    def get(self, user):
        """Get requests for new institutions."""
        queryRequests = RequestInstitution.query(
            RequestInstitution.status == 'sent'
        )

        requests = [request.make() for request in queryRequests]
        self.response.write(json.dumps(requests))

    @login_required
    @json_response
    def post(self, user):
        """Handler of post requests."""
        data = json.loads(self.request.body)
        host = self.request.host
        inst_request_type = 'REQUEST_INSTITUTION'

        type_of_invite = data.get('type_of_invite')

        Utils._assert(
            type_of_invite != inst_request_type,
            "The type must be REQUEST_INSTITUTION",
            EntityException
        )

        user.name = data['admin']['name']
        user.put()

        inst_stub = createInstitution(user, data)
        data['sender_key'] = user.key.urlsafe()
        data['institution_key'] = inst_stub.key.urlsafe()
        data['admin_key'] = user.key.urlsafe()

        request = InviteFactory.create(data, type_of_invite)
        request.put()

        request.sendInvite(user, host)

        self.response.write(json.dumps(request.make()))
