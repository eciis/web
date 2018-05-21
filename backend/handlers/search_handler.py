# -*- coding: utf-8 -*-
"""Search Handler."""

from util.login_service import login_required
from utils import json_response
import json

from . import BaseHandler
from search_module.search_user import SearchUser
from search_module import SearchInstitution

__all__ = ['SearchHandler']

SEARCH_TYPES = {
    'institution': SearchInstitution,
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
        search_entity = SEARCH_TYPES[search_type]()
        self.response.write(
            json.dumps(search_entity.getDocuments(value, state))
        )
