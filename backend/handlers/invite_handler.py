# -*- coding: utf-8 -*-
"""Invite Handler."""

from google.appengine.ext import ndb
import json

from util import login_required
from . import BaseHandler
from models import InstitutionProfile
from models import Invite
from custom_exceptions import FieldException
from custom_exceptions import NotAuthorizedException
from utils import json_response
from utils import Utils
from util import JsonPatch

__all__ = ['InviteHandler']


class InviteHandler(BaseHandler):
    """Invite Handler."""

    @json_response
    def get(self, invite_urlsafe):
        """Get the invite whose key is invite_urlsafe."""
        invite_key = ndb.Key(urlsafe=invite_urlsafe)
        invite = Invite.get_by_id(invite_key.id())
        invite = invite.make()

        self.response.write(json.dumps(invite))