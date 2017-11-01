# -*- coding: utf-8 -*-
"""Search Handler."""

from utils import login_required
from utils import json_response
import json

from handlers.base_handler import BaseHandler
from search_document.search_user import SearchUser
from search_document.search_institution import SearchInstitution

types = {'institution': SearchInstitution,
         'user': SearchUser
         }


class SearchHandler(BaseHandler):
    """Search Handler."""

    @json_response
    @login_required
    def get(self, user):
        """Handle GET Requests."""
        value = self.request.get('value')
        state = self.request.get('state')
        search_type = self.request.get('type')
        search_entity = types[search_type]()
        self.response.write(
            json.dumps(search_entity.getDocuments(value, state))
        )
