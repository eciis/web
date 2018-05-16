# -*- coding: utf-8 -*-
"""Institution Parent Request Handler."""

import json
from utils import login_required
from utils import json_response
from . import BaseHandler
from service_entities import enqueue_task
from google.appengine.ext import ndb

__all__ = ['InstitutionParentRequestHandler']

class InstitutionParentRequestHandler(BaseHandler):
    """Institution Parent Request Handler."""

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
        """Handler PUT Requests. Change status of parent_request from 'sent' to 'accepted'."""
        request = ndb.Key(urlsafe=request_key).get()
        user.check_permission('answer_link_inst_request',
                              'User is not allowed to accept link between institutions',
                              request.institution_requested_key.urlsafe())
        request.change_status('accepted')
        request.put()

        parent_institution = request.institution_requested_key.get()
        parent_institution.children_institutions.append(request.institution_key)
        parent_institution.put()

        institution_children = request.institution_key.get()
        
        request.send_response_notification(user.current_institution, user.key, 'ACCEPT')
        request.send_response_email('ACCEPT')

        enqueue_task('add-admin-permissions', {'institution_key': institution_children.key.urlsafe()})

        self.response.write(json.dumps(request.make()))

    @login_required
    @json_response
    def delete(self, user, request_key):
        """Change request status from 'sent' to 'rejected'."""
        request = ndb.Key(urlsafe=request_key).get()
        user.check_permission('answer_link_inst_request',
                              'User is not allowed to reject link between institutions',
                              request.institution_requested_key.urlsafe())
        request.change_status('rejected')
        request.put()

        request.send_response_notification(user.current_institution, user.key, 'REJECT')
