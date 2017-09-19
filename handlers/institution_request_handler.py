# -*- coding: utf-8 -*-
"""Institution Request Handler."""

import json
from utils import login_required
from utils import json_response
from utils import is_admin_of_requested_inst
from handlers.base_handler import BaseHandler
from google.appengine.ext import ndb


class InstitutionRequestHandler(BaseHandler):
    """Institution Request Handler."""

    @login_required
    @json_response
    def get(self, user, request_key):
        """Handler GET Requests."""
        request = ndb.Key(urlsafe=request_key).get()
        self.response.write(json.dumps(request.make()))

    @login_required
    @json_response
    @is_admin_of_requested_inst
    @ndb.transactional(xg=True)
    def put(self, user, request_key):
        """Handler PUT Requests."""
        request = ndb.Key(urlsafe=request_key).get()
        request.change_status('accepted')
        request.put()

        institution = request.stub_institution_key.get()
        institution.state = 'active'
        institution.put()

        sender = request.sender_key.get()
        sender.add_institution(institution.key)
        sender.follow(institution.key)
        sender.institutions_admin.append(institution.key)
        sender.change_state('active')

        self.response.write(json.dumps(request.make()))

    @login_required
    @is_admin_of_requested_inst
    def delete(self, user, request_key):
        """Change request status from 'sent' to 'rejected'."""
        request_key = ndb.Key(urlsafe=request_key)
        request = request_key.get()
        request.change_status('rejected')
        request.put()
