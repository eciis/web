# -*- coding: utf-8 -*-
"""Institution Request Handler."""

import json
import permissions

from util import login_required
from utils import json_response
from . import BaseHandler
from google.appengine.ext import ndb
from utils import Utils
from custom_exceptions import NotAuthorizedException

__all__ = ['InstitutionRequestHandler']

class InstitutionRequestHandler(BaseHandler):
    """Institution Request Handler."""

    @login_required
    @json_response
    def get(self, user, request_key):
        """Handler GET Requests."""
        request = ndb.Key(urlsafe=request_key).get()
        user.check_permission(
            'analyze_request_inst',
            'User is not allowed to make this action.',
            request.institution_requested_key.urlsafe()
        )
        self.response.write(json.dumps(request.make()))

    @login_required
    @json_response
    @ndb.transactional(xg=True)
    def put(self, user, request_key):
        """Handler PUT Requests."""
        request = ndb.Key(urlsafe=request_key).get()

        Utils._assert(request.status != 'sent',
                      "This request has already been processed",
                      NotAuthorizedException)

        user.check_permission(
            'analyze_request_inst',
            'User is not allowed to make this action.',
            request.institution_requested_key.urlsafe()
        )

        request.change_status('accepted')
        request.put()

        institution = request.institution_key.get()
        institution.state = 'active'

        sender = request.sender_key.get()
        sender.add_institution(institution.key)
        sender.follow(institution.key)
        sender.institutions_admin.append(institution.key)
        sender.change_state('active')

        sender.config_user_adm(institution)

        institution.follow(sender.key)
        institution.add_member(sender)
        institution.set_admin(sender.key)
        institution.put()

        request.send_response_email("ACCEPT")

        self.response.write(json.dumps(request.make()))

    @login_required
    @json_response
    def delete(self, user, request_key):
        """Change request status from 'sent' to 'rejected'."""
        request_key = ndb.Key(urlsafe=request_key)
        request = request_key.get()

        Utils._assert(request.status != 'sent',
                      "This request has already been processed",
                      NotAuthorizedException)

        user.check_permission(
            'analyze_request_inst',
            'User is not allowed to make this action.',
            request.institution_requested_key.urlsafe()
        )

        request.change_status('rejected')
        request.put()

        institution = request.institution_key.get()
        institution.state = 'inactive'
        institution.put()

        host = self.request.host
        request.send_response_email("REJECT", host)