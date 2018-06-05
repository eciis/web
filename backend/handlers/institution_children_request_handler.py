# -*- coding: utf-8 -*-
"""Institution Children Request Handler."""

import json
from util import login_required
from utils import json_response
from utils import Utils
from . import BaseHandler
from service_entities import enqueue_task
from google.appengine.ext import ndb
from custom_exceptions import NotAuthorizedException

__all__ = ['InstitutionChildrenRequestHandler']

class InstitutionChildrenRequestHandler(BaseHandler):
    """Institution Children Request Handler."""

    @login_required
    @json_response
    def get(self, user, request_key):
        """Handler GET Requests.. 
            Return the request send to user requestting link with institution that he/she administers."""
        request = ndb.Key(urlsafe=request_key).get()
        has_permission = user.has_permission('answer_link_inst_request', request.institution_requested_key.urlsafe())
        Utils._assert(not has_permission,
                      'User is not allowed to acess request link.',
                      NotAuthorizedException)

        self.response.write(json.dumps(request.make()))

    @login_required
    @json_response
    @ndb.transactional(xg=True)
    def put(self, user, request_key):
        """Handler PUT Requests. Change status of children_request from 'sent' to 'accepted'."""
        request = ndb.Key(urlsafe=request_key).get()        
        user.check_permission('answer_link_inst_request',
                              'User is not allowed to accept link between institutions',
                              request.institution_requested_key.urlsafe())
        
        Utils._assert(
            request.institution_requested_key.get().parent_institution != None,
            "The institution's already have a parent",
            NotAuthorizedException
        )

        request.change_status('accepted')

        institution_children = request.institution_requested_key.get()
        institution_children.set_parent(request.institution_key)

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

        institution_children = request.institution_requested_key.get()

        if institution_children.parent_institution == request.institution_key:
            institution_children.set_parent(None)

        request.send_response_notification(user.current_institution, user.key, 'REJECT')
        request.send_response_email('REJECT')
        
