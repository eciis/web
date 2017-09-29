# -*- coding: utf-8 -*-
"""Institution Request Handler."""

import json
import search_module
from utils import login_required
from utils import json_response
from utils import has_analyze_request_permission
from handlers.base_handler import BaseHandler
from google.appengine.ext import ndb


class InstitutionRequestHandler(BaseHandler):
    """Institution Request Handler."""

    @login_required
    @json_response
    @has_analyze_request_permission
    def get(self, user, request_key):
        """Handler GET Requests."""
        request = ndb.Key(urlsafe=request_key).get()
        self.response.write(json.dumps(request.make()))

    @login_required
    @json_response
    @has_analyze_request_permission
    @ndb.transactional(xg=True)
    def put(self, user, request_key):
        """Handler PUT Requests."""
        request = ndb.Key(urlsafe=request_key).get()
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

        institution.admin = sender.key
        institution.members.append(sender.key)
        institution.followers.append(sender.key)
        institution.put()

        search_module.createDocument(institution)
        self.response.write(json.dumps(request.make()))

    @login_required
    @has_analyze_request_permission
    def delete(self, user, request_key):
        """Change request status from 'sent' to 'rejected'."""
        request_key = ndb.Key(urlsafe=request_key)
        request = request_key.get()
        request.change_status('rejected')
        request.put()

        institution = request.institution_key.get()
        institution.state = 'inactive'
        institution.put()
