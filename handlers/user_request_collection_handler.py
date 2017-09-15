# -*- coding: utf-8 -*-
"""User Request Collection Handler."""

import json
from google.appengine.ext import ndb
from utils import login_required
from utils import json_response
from utils import Utils
from models.request_user import RequestUser
from custom_exceptions.entityException import EntityException
from handlers.base_handler import BaseHandler
from models.factory_invites import InviteFactory
from models.user import InstitutionProfile


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
        data = json.loads(self.request.body)
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
        print "recebido no handler"
        print user 

        user.name = data.get('sender_name')
        user_profile = InstitutionProfile()
        user_profile.email = data.get('institutional_email')
        user_profile.institution_key = data.get('institution_key')
        user_profile.office = data.get('office')
        user_profile.name = data.get('sender_name')
        user.institution_profiles.append(user_profile)

        print "com alterações"
        print user

        user.put()

        print "depois do put"
        print user

        if(request.stub_institution_key):
            request.stub_institution_key.get().addInvite(request)

        request.sendInvite(user, host)

        make_invite = request.make()

        self.response.write(json.dumps(make_invite))
