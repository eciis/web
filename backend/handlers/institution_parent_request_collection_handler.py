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
from custom_exceptions.notAuthorizedException import NotAuthorizedException


__all__ = ['InstitutionParentRequestCollectionHandler']

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

        child_key = data.get('institution_key')
        child_key = ndb.Key(urlsafe=child_key)
        requested_inst_key = data.get('institution_requested_key')
        requested_inst_key = ndb.Key(urlsafe=requested_inst_key)

        Utils._assert(
            Institution.has_connection_between(requested_inst_key, child_key),
            "Circular hierarchy not allowed",
            EntityException
        )

        request = InviteFactory.create(data, type_of_invite)
        request.put()

        child_institution = child_key.get()
        child_institution.parent_institution = requested_inst_key
        child_institution.put()

        request.send_invite(host, user.current_institution)

        self.response.write(json.dumps(request.make()))
