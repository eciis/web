# -*- coding: utf-8 -*-
"""Institution Collection Request Handler."""

import json
from google.appengine.ext import ndb
from utils import login_required
from utils import json_response
from utils import Utils
from custom_exceptions.entityException import EntityException
from handlers.base_handler import BaseHandler
from models.factory_invites import InviteFactory
from models.request_institution import RequestInstitution


class InstitutionCollectionRequestHandler(BaseHandler):
    """Institution Children Request Handler."""

    @json_response
    @login_required
    def get(self, user, institution_key):
        """Get requests for parent links."""
        queryRequests = RequestInstitution.query(
            RequestInstitution.institution_key == ndb.Key(urlsafe=institution_key),
            RequestInstitution.status == 'sent'
        )

        requests = [request.make() for request in queryRequests]

        self.response.write(json.dumps(requests))
