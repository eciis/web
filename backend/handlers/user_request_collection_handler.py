# -*- coding: utf-8 -*-
"""User Request Collection Handler."""
import json
from google.appengine.ext import ndb
from util import login_required
from utils import json_response
from utils import Utils
from models import RequestUser
from custom_exceptions import EntityException
from . import BaseHandler
from models import InviteFactory

__all__ = ['UserRequestCollectionHandler']

class UserRequestCollectionHandler(BaseHandler):
    """User Request Collection Handler."""

    @json_response
    @login_required
    def get(self, user, institution_key):
        """Get invites for new institutions make by Plataform."""
        queryRequests = RequestUser.query(
            RequestUser.institution_key == ndb.Key(urlsafe=institution_key),
            RequestUser.status == 'sent'
        )

        requests = [request.make() for request in queryRequests]

        self.response.write(json.dumps(requests))

    @login_required
    @json_response
    def post(self, user, institution_key):
        """Handler of post requests."""
        body = json.loads(self.request.body)
        data = body['data']
        host = self.request.host
        user_request_type = 'REQUEST_USER'

        type_of_invite = data.get('type_of_invite')
        Utils._assert(
            type_of_invite != user_request_type,
            "The type must be REQUEST_USER",
            EntityException
        )

        request = InviteFactory.create(data, type_of_invite)
        request.put()
        
        user.name = data.get('sender_name')
        user.put()

        if(request.stub_institution_key):
            request.stub_institution_key.get().addInvite(request)

        request.send_invite(host, user.current_institution)
        make_invite = request.make()

        self.response.write(json.dumps(make_invite))
