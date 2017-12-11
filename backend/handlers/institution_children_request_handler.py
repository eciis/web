# -*- coding: utf-8 -*-
"""Institution Children Request Handler."""

import json
from utils import login_required
from utils import json_response
from handlers.base_handler import BaseHandler
from google.appengine.ext import ndb



class InstitutionChildrenRequestHandler(BaseHandler):
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
        """Handler PUT Requests. Change status of children_request from 'sent' to 'accepted'."""
        request = ndb.Key(urlsafe=request_key).get()
        user.has_permission('answer_link_inst_request',
                            'User is not allowed to accept link between institutions',
                            request.institution_requested_key.urlsafe())
        request.change_status('accepted')
        request.put()

        institution_children = request.institution_requested_key.get()
        institution_children.parent_institution = request.institution_key
        institution_children.put()

        parent_institution = request.institution_key.get()
        parent_institution.children_institutions.append(request.institution_requested_key)
        parent_institution.put()

        admin_of_parent_inst = parent_institution.admin.get()
        admin_of_parent_inst.add_permissions(["remove_link", "remove_inst"], institution_children.key.urlsafe())

        user.add_permission("remove_link", parent_institution.key.urlsafe())

        request.send_response_notification(user, request.admin_key.urlsafe(), 'ACCEPT_INSTITUTION_LINK')

        self.response.write(json.dumps(request.make()))

    @login_required
    @json_response
    def delete(self, user, request_key):
        """Change request status from 'sent' to 'rejected'."""
        request = ndb.Key(urlsafe=request_key).get()
        user.has_permission('answer_link_inst_request',
                            'User is not allowed to reject link between institutions',
                            request.institution_requested_key.urlsafe())
        request.change_status('rejected')
        request.put()

        request.send_response_notification(user, request.admin_key.urlsafe(), 'REJECT_INSTITUTION_LINK')
