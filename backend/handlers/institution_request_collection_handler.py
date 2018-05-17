# -*- coding: utf-8 -*-
"""Institution Collection Request Handler."""

import json
from util.login_service import login_required
from utils import json_response
from utils import Utils
from custom_exceptions.entityException import EntityException
from . import BaseHandler
from models import Institution
from models import Address
from models.factory_invites import InviteFactory
from models.request_institution import RequestInstitution

__all__ = ['InstitutionRequestCollectionHandler']

def createInstitution(user, data):
    """Cretate a new institution stub."""
    inst_stub = Institution()

    for property in data:
        if property != 'admin':
            setattr(inst_stub, property, data[property])

    if (data.get("photo_url") is None):
            inst_stub.photo_url = "app/images/institution.png"

    inst_stub.address = Address.create(data.get('address'))
    inst_stub.state = 'pending'
    inst_stub.put()

    return inst_stub


class InstitutionRequestCollectionHandler(BaseHandler):
    """Institution Request Handler."""

    @json_response
    @login_required
    def get(self, user, institution_key):
        """Get requests for new institutions."""
        user.check_permission(
            'analyze_request_inst',
            'User is not allowed to get requests',
            institution_key)

        queryRequests = RequestInstitution.query(
            RequestInstitution.status == 'sent'
        )

        requests = [request.make() for request in queryRequests]
        self.response.write(json.dumps(requests))

    @login_required
    @json_response
    def post(self, user, institution_key):
        """Handler of post requests."""
        body = json.loads(self.request.body)
        data = body['data']
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

        request.send_invite(host, user.current_institution)

        self.response.write(json.dumps(request.make()))
