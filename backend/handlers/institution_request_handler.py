# -*- coding: utf-8 -*-
"""Institution Request Handler."""

import json
import permissions

from utils import login_required
from utils import json_response
from . import BaseHandler
from google.appengine.ext import ndb
from utils import Utils
from custom_exceptions.notAuthorizedException import NotAuthorizedException

__all__ = ['InstitutionRequestHandler']

def check_permission(user, operation, institution_key):
    user.check_permission(
        'analyze_request_inst',
        'User is not allowed to %s requests' %(operation),
        institution_key)

class InstitutionRequestHandler(BaseHandler):
    """Institution Request Handler."""

    @login_required
    @json_response
    def get(self, user, request_key):
        """Handler GET Requests."""
        request = ndb.Key(urlsafe=request_key).get()
        check_permission(
            user,
            'get',
            request.institution_requested_key.urlsafe())
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

        check_permission(
            user,
            'put',
            request.institution_requested_key.urlsafe())

        request.change_status('accepted')
        request.put()

        institution = request.institution_key.get()
        institution.state = 'active'

        sender = request.sender_key.get()
        sender.add_institution(institution.key)
        sender.follow(institution.key)
        sender.institutions_admin.append(institution.key)
        sender.change_state('active')

        data_profile = {
            'office': 'Administrador',
            'institution_key': institution.key.urlsafe(),
            'institution_name': institution.name,
            'institution_photo_url': institution.photo_url
        }
        sender.create_and_add_profile(data_profile)
        sender.add_permissions(permissions.DEFAULT_ADMIN_PERMISSIONS, institution.key.urlsafe())

        institution.follow(sender.key)
        institution.add_member(sender)
        institution.set_admin(sender.key)
        institution.put()

        request.send_response_email()

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

        check_permission(
            user,
            'remove',
            request.institution_requested_key.urlsafe())
        request.change_status('rejected')
        request.put()

        institution = request.institution_key.get()
        institution.state = 'inactive'
        institution.put()

        host = self.request.host
        request.send_response_email(host, "REJECT")