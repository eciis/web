# -*- coding: utf-8 -*-
"""Institution Collection Handler."""

import json

from utils import Utils
from utils import login_required
from utils import json_response

from models.institution import Institution

from handlers import search_handler
from handlers.base_handler import BaseHandler


class InstitutionCollectionHandler(BaseHandler):
    """Institution Collection Handler."""

    @json_response
    @login_required
    def get(self, user):
        """Get all institutions."""
        institution_collection = Institution.query().fetch()
        self.response.write(json.dumps(
            Utils.toJson(institution_collection, host=self.request.host)
        ))

    """
    TODO: Create tests to post institution.
    @author: Andre L Abrantes - 23-06-2017
    """
    @json_response
    @login_required
    def post(self, user):
        """Create a new institution."""
        data = json.loads(self.request.body)
        institution = Institution.create(data, user)
        search_handler.CreateDocument(
            {'id': str(institution.key.id()), 'name': institution.name, 'state': institution.state})

        self.response.write(json.dumps(
            Utils.toJson(institution, host=self.request.host)
        ))
