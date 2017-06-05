# -*- coding: utf-8 -*-
"""User Timeline Handler."""

from google.appengine.ext import ndb
import json

from utils import login_required
from utils import json_response
from utils import createEntity

from handlers.base_handler import BaseHandler
from models.user import User


class InstitutionMembersHandler(BaseHandler):
    """Get members of specific institution."""

    @json_response
    @login_required
    def get(self, user, url_string):

        institution_key = ndb.Key(urlsafe=url_string)
        queryMembers = User.query(institution_key.IN(User.institutions))

        #array = [createEntity(User, member) for member in queryMembers]

        self.response.write(queryMembers)
