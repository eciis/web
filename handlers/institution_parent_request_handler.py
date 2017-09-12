# -*- coding: utf-8 -*-
"""Institution Parent Request Handler."""

import json
from utils import login_required
from utils import json_response
from utils import Utils
from handlers.base_handler import BaseHandler
from google.appengine.ext import ndb


class InstitutionParentRequestHandler(BaseHandler):
    """Institution Children Request Handler."""

    @login_required
    @json_response
    def get(self, user, request_key):
        """Handler GET Requests."""
        request = ndb.Key(urlsafe=request_key).get()
        self.response.write(json.dumps(request.make()))

    @login_required
    @json_response
    @ndb.transactional(xg=True)
    def put(self, user, request_key):
        """Handler PUT Requests."""
        request = ndb.Key(urlsafe=request_key).get()
        request.change_status('accepted')
        request.put()

        parent_institution = request.institution_key.get()
        parent_institution.children_institutions.append(request.institution_requested_key)
        parent_institution.put()

        self.response.write(json.dumps(Utils.toJson(institution_children)))

    @login_required
    def delete(self, user, request_key):
        """Change request status from 'sent' to 'rejected'."""
        request_key = ndb.Key(urlsafe=request_key)
        request = request_key.get()
        request.change_status('rejected')
        request.put()
