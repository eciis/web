# -*- coding: utf-8 -*-
"""Institution Children RequestHandler."""

import json
from utils import login_required
from utils import json_response
from utils import Utils
from custom_exceptions.entityException import EntityException
from handlers.base_handler import BaseHandler
from models.factory_invites import InviteFactory


class InstitutionChildrenRequestHandler(BaseHandler):
    """Request Handler."""

    @login_required
    @json_response
    def post(self, user):
        """Handler of post requests."""
        data = json.loads(self.request.body)
        host = self.request.host
        inst_children_request_type = 'REQUEST_INSTITUTION_CHILDREN'

        type_of_invite = data.get('type_of_invite')

        Utils._assert(
            type_of_invite != inst_children_request_type,
            "The type must be REQUEST_INSTITUTION_CHILDREN",
            EntityException
        )

        request = InviteFactory.create(data, type_of_invite)
        request.put()

        parent_institution = request.institution_key.get()
        parent_institution.children_institutions.append(request.institution_requested_key.key)
        parent_institution.put()

        request.sendInvite(user, host)

        self.response.write(json.dumps(request.make()))
