# -*- coding: utf-8 -*-
"""Request Handler."""

import json
from utils import Utils
from google.appengine.ext import ndb
from utils import login_required
from handlers.base_handler import BaseHandler


def makeUser(user, request):
    """TODO: Move this method to User when utils.py is refactored.

    @author Andre L Abrantes - 20-06-2017
    """
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
    def get(self, user, request_key):
        """Handler GET Requests."""
        request = ndb.Key(urlsafe=request_key).get()
        self.response.write(json.dumps(request.make()))

    @login_required
    @ndb.transactional(xg=True)
    def put(self, user, request_key):
        """Handler PUT Requests."""
        request = ndb.Key(urlsafe=request_key).get()
        request.change_status('accepted')

        institution_key = request.institution_key
        user = request.sender_key.get()

        user.add_institution(institution_key)
        user.follow(institution_key)
        user.change_state('active')

        institution = institution_key.get()

        institution.add_member(user)
        institution.follow(user.key)

        self.response.write(json.dumps(makeUser(user, self.request)))

    @login_required
    def delete(self, user, request_key):
        """Change invite status from 'sent' to 'resolved'."""
        request_key = ndb.Key(urlsafe=request_key)
        request = request_key.get()
        request.change_status('rejected')
        request.put()
