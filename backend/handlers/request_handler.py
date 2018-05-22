# -*- coding: utf-8 -*-
"""Request Handler."""

import json
from utils import Utils
from google.appengine.ext import ndb
from util import login_required
from utils import json_response
from . import BaseHandler
from custom_exceptions import EntityException

__all__ = ['RequestHandler']

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
    @json_response
    def get(self, user, request_key):
        """Handler GET Requests."""
        request = ndb.Key(urlsafe=request_key).get()
        self.response.write(json.dumps(request.make()))

    @login_required
    @json_response
    @ndb.transactional(xg=True)
    def put(self, user, request_key):
        """Handler PUT to accept user Request ."""
        request = ndb.Key(urlsafe=request_key).get()
        institution_key = request.institution_key
        
        Utils._assert(
            request.status != 'sent',
            "this request has already been processed",
            EntityException)
        
        user.check_permission('answer_user_request',
                              "User is not allowed to accept user request",
                              request.institution_requested_key.urlsafe())

        request.change_status('accepted')
        request.put()
        institution = institution_key.get()
        sender = request.sender_key.get()

        sender.add_institution(institution_key)
        sender.follow(institution_key)
        sender.change_state('active')

        institution.add_member(sender)
        institution.follow(sender.key)
        institution.put()

        data_profile = {
            'office': request.office,
            'email': request.institutional_email,
            'institution_key': institution_key.urlsafe(),
            'institution_name': institution.name,
            'institution_photo_url': institution.photo_url
        }
        sender.create_and_add_profile(data_profile)

        host = self.request.host
        request.send_response_email(host, "ACCEPT")
        request.send_response_notification(user, user.current_institution, 'ACCEPT')

        self.response.write(json.dumps(makeUser(sender, self.request)))

    @login_required
    @json_response
    def delete(self, user, request_key):
        """Change request status from 'sent' to 'rejected'."""
        request = ndb.Key(urlsafe=request_key).get()
        institution_key = request.institution_requested_key.urlsafe()

        Utils._assert(
            request.status != 'sent',
            "this request has already been processed",
            EntityException)
        
        user.check_permission('answer_user_request',
                              "User is not allowed to reject user request",
                              institution_key)

        request.change_status('rejected')

        sender_user = request.sender_key.get()
        sender_user.remove_profile(institution_key)

        sender_user.put()
        request.put()

        host = self.request.host
        request.send_response_email(host, "REJECT")
        request.send_response_notification(user, user.current_institution, 'REJECT')

        self.response.write(json.dumps(makeUser(sender_user, self.request)))