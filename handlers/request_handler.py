# -*- coding: utf-8 -*-
"""Request Handler."""

import json
from utils import login_required
from utils import json_response
from handlers.base_handler import BaseHandler
from models.factory_invites import InviteFactory


class RequestHandler(BaseHandler):
    """Request Handler."""

    @login_required
    @json_response
    def post(self, user):
        data = json.loads(self.request.body)
        host = self.request.host

        type_of_invite = data.get('type_of_invite')
        request = InviteFactory.create(data, type_of_invite)
        request.put()

        if(request.stub_institution_key):
            request.stub_institution_key.get().addInvite(request)

        request.sendInvite(user, host)

        make_invite = request.make()

        self.response.write(json.dumps(make_invite))
