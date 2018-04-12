# -*- coding: utf-8 -*-
"""Institution Parent Collectcion Request Handler."""

from google.appengine.ext import ndb
import json
from utils import login_required
from utils import json_response
from utils import Utils
from custom_exceptions.entityException import EntityException
from handlers.base_handler import BaseHandler
from models.factory_invites import InviteFactory
from models.request_institution_parent import RequestInstitutionParent
from custom_exceptions.notAuthorizedException import NotAuthorizedException


class InstitutionParentRequestCollectionHandler(BaseHandler):
    """Institution Parent Collectcion Request Handler."""

    @json_response
    @login_required
    def get(self, user, institution_key):
        """Get requests for parent links."""
        inst_key_obj = ndb.Key(urlsafe=institution_key)
        queryRequests = RequestInstitutionParent.query(
            ndb.OR(RequestInstitutionParent.institution_requested_key == inst_key_obj,
                   RequestInstitutionParent.institution_key == inst_key_obj),
            RequestInstitutionParent.status == 'sent'
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

        request.send_invite(host, user.current_institution)

        self.response.write(json.dumps(request.make()))
