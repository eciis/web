# -*- coding: utf-8 -*-
"""Search Handler."""

from utils import login_required
from utils import json_response
import json

from handlers.base_handler import BaseHandler
import search_module

INDEX_NAME = 'institution'


class SearchHandler(BaseHandler):
    """Search Handler."""

    @json_response
    @login_required
    def get(self, user):
        """Handle GET Requests."""
        institution = self.request.get('name')
        state = self.request.get('state')
        self.response.write(
            json.dumps(search_module.getDocuments(institution, state))
        )
