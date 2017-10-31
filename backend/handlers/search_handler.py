# -*- coding: utf-8 -*-
"""Search Handler."""

from utils import login_required
from utils import json_response
import json

from handlers.base_handler import BaseHandler
import search_module
from search_user_module import getDocuments


class SearchHandler(BaseHandler):
    """Search Handler."""

    @json_response
    @login_required
    def get(self, user):
        """Handle GET Requests."""
        value = self.request.get('value')
        state = self.request.get('state')
        search_type = self.request.get('type')
        if search_type == 'institution':
            self.response.write(
                json.dumps(search_module.getDocuments(value, state))
            )
        else:
            self.response.write(
                json.dumps(getDocuments(value, state))
            )
