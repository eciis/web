# -*- coding: utf-8 -*-
"""Institution Collection Handler."""

import json

from utils import Utils
from utils import login_required
from utils import json_response

from models.institution import Institution

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
