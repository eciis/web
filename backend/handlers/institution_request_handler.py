# -*- coding: utf-8 -*-
"""Institution Request Handler."""

import json
import permissions

from utils import login_required
from utils import json_response
from utils import check_permission
from handlers.base_handler import BaseHandler
from google.appengine.ext import ndb

def has_permission(user, institution_key):
    permission_type='analyze_request_inst'
    check_permission(
        user, 
        permission_type, 
        institution_key)

class InstitutionRequestHandler(BaseHandler):
    """Institution Request Handler."""

    @login_required
    @json_response
    def get(self, user, request_key):
        """Handler GET Requests."""
        request = ndb.Key(urlsafe=request_key).get()
        has_permission(
            user, 
            request.institution_requested_key.urlsafe())
        self.response.write(json.dumps(request.make()))

    @login_required
    @json_response
    @ndb.transactional(xg=True)
    def put(self, user, request_key):
        """Handler PUT Requests."""
        request = ndb.Key(urlsafe=request_key).get()
        has_permission(
            user, 
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
        user.add_permissions(permissions.DEFAULT_ADMIN_PERMISSIONS, institution.key.urlsafe())

        institution.admin = sender.key
        institution.members.append(sender.key)
        institution.followers.append(sender.key)
        institution.put()

        self.response.write(json.dumps(request.make()))

    @login_required
    def delete(self, user, request_key):
        """Change request status from 'sent' to 'rejected'."""
        request_key = ndb.Key(urlsafe=request_key)
        request = request_key.get()
        has_permission(
            user, 
            request.institution_requested_key.urlsafe())
        request.change_status('rejected')
        request.put()

        institution = request.institution_key.get()
        institution.state = 'inactive'
        institution.put()
