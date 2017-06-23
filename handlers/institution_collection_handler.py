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

    @json_response
    @login_required
    def post(self, user):
        """Create a new institution."""
        print self.request.body
        data = json.loads(self.request.body)

        institution = Institution()

        institution.name = data['name']
        institution.phone_number = data['phone_number']
        institution.address = data['address']
        institution.description = data['description']
        institution.image_url = "http://eciis-splab.appspot.com/images/oms.png"

        institution.admin = user.key
        institution.members.append(user.key)

        institution.put()

        user.institutions.append(institution.key)
        user.institutions_admin.append(institution.key)

        user.put()

        self.response.write(json.dumps(
            Utils.toJson(institution, host=self.request.host)
        ))
