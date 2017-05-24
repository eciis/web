# -*- coding: utf-8 -*-
"""User Handler."""

import json

from utils import Utils
from utils import login_required
from utils import json_response

from handlers.base import BaseHandler


class UserHandler(BaseHandler):
    """User Handler."""

    @json_response
    @login_required
    def get(self, user):
        """Handle GET Requests."""
        self.response.write(json.dumps(
            Utils.toJson(user, host=self.request.host)
        ))
