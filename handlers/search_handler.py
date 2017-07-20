# -*- coding: utf-8 -*-
"""Search Handler."""

from utils import login_required
from utils import json_response
import json
from google.appengine.api import search

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
        query_string = "institution: %s AND %s" % (institution, state)
        index = search.Index(INDEX_NAME)
        query_options = search.QueryOptions(
            returned_fields=['institution']
        )
        query = search.Query(query_string=query_string, options=query_options)
        results = index.search(query)
        self.response.write(
            json.dumps(search_module.processDocuments(results))
        )
