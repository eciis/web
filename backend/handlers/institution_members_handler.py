# -*- coding: utf-8 -*-
"""Institution Members Handler."""

from google.appengine.ext import ndb
import json

from handlers.institution_handler import is_admin
from utils import login_required
from utils import Utils
from utils import json_response

from handlers.base_handler import BaseHandler


class InstitutionMembersHandler(BaseHandler):
    """Get members of specific institution."""

    @json_response
    @login_required
    def get(self, user, url_string):
        """Get members of specific institution."""
        institution_key = ndb.Key(urlsafe=url_string)
        institution = institution_key.get()

        array = [member.get() for member in institution.members]

        self.response.write(json.dumps(Utils.toJson(array)))

    @json_response
    @login_required
    @is_admin
    @ndb.transactional(xg=True)
    def delete(self, user, url_string):
        """Delete member of specific institution."""
        institution_key = ndb.Key(urlsafe=url_string)
        institution = institution_key.get()

        data = self.request.get('removeMember')
        member = ndb.Key(urlsafe=data)
        member = member.get()

        institution.remove_member(member)
