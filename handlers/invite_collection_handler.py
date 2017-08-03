# -*- coding: utf-8 -*-
"""Invite Collection Handler."""

import json
from google.appengine.ext import ndb

from utils import login_required
from utils import json_response
from utils import Utils
from custom_exceptions.notAuthorizedException import NotAuthorizedException
from handlers.base_handler import BaseHandler
from models.invite import Invite
from models.invite_user import InviteUser
from models.invite_institution import InviteInstitution


def is_admin(method):
        """Check if the user is admin of the institution."""
        def check_authorization(self, user, *args):
            data = json.loads(self.request.body)
            institution_key = ndb.Key(urlsafe=data['institution_key'])
            institution = institution_key.get()

            userisNotAdminOfInstitution = institution.key not in user.institutions_admin
            institutionisNotManagedByUser = institution.admin != user.key

            Utils._assert(userisNotAdminOfInstitution or institutionisNotManagedByUser,
                          'User is not admin', NotAuthorizedException)

            method(self, user, *args)
        return check_authorization


class InviteCollectionHandler(BaseHandler):
    """Invite Collection Handler."""

    @json_response
    @login_required
    def get(self, user):
        """Get invites for new institutions make by Plataform"""
        invites = []

        queryInvites = Invite.query(Invite.type_of_invite == "institution")

        invites = [invite.make() for invite in queryInvites]

        self.response.write(json.dumps(invites))

    @json_response
    @login_required
    @is_admin
    def post(self, user):
        """Handle POST Requests."""
        data = json.loads(self.request.body)

        if data.get('type_of_invite') == 'user':
            invite = InviteUser.create(data)
            invite.put()
        else:
            invite = InviteInstitution.create(data)
            invite.put()

        invite.sendInvite()
        make_invite = invite.make()

        self.response.write(json.dumps(make_invite))
