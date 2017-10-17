# -*- coding: utf-8 -*-
"""Request Handler."""

import json
from utils import Utils
from google.appengine.ext import ndb
from utils import login_required
from utils import json_response
from utils import getSuperUsers
from handlers.base_handler import BaseHandler
from custom_exceptions.entityException import EntityException
from utils import is_admin_of_requested_inst


def makeUser(user, request):
    """Method of make user."""
    user_json = Utils.toJson(user, host=request.host)
    user_json['logout'] = 'http://%s/logout?redirect=%s' %\
        (request.host, request.path)
    user_json['institutions'] = []
    for institution in user.institutions:
        user_json['institutions'].append(
            Utils.toJson(institution.get())
        )
    user_json['follows'] = [institution_key.get().make(
        ['acronym', 'photo_url', 'key', 'parent_institution']) for institution_key in user.follows]
    return user_json


class RequestHandler(BaseHandler):
    """Request Handler."""

    @login_required
    @is_admin_of_requested_inst
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
        Utils._assert(
            request.status != 'sent',
            "this request has already been processed",
            EntityException)

        request.change_status('accepted')
        request.put()

        institution_key = request.institution_key
        institution = institution_key.get()
        user = request.sender_key.get()

        user.add_institution(institution_key)
        user.follow(institution_key)
        user.change_state('active')
        user.put()

        institution.add_member(user)
        institution.follow(user.key)
        institution.put()

        host = self.request.host
        request.send_response_email(host, "ACCEPT")

        self.response.write(json.dumps(makeUser(user, self.request)))

    @login_required
    @is_admin_of_requested_inst
    @json_response
    def delete(self, user, request_key):
        """Change request status from 'sent' to 'rejected'."""
        request = ndb.Key(urlsafe=request_key).get()
        Utils._assert(
            request.status != 'sent',
            "this request has already been processed",
            EntityException)

        request.change_status('rejected')

        institution_key = request.institution_requested_key.urlsafe()
        sender_user = request.sender_key.get()
        sender_user.remove_profile(institution_key)

        sender_user.put()
        request.put()

        host = self.request.host
        request.send_response_email(host, "REJECT")