# -*- coding: utf-8 -*-
"""Main Handler."""

import json

from utils import Utils
from utils import login_required
from utils import json_response

from handlers.base import BaseHandler


class MainHandler(BaseHandler):
    """Main Handler."""

    @json_response
    @login_required
    def get(self, user):
        """Handle HTTP GET request."""
        user_json = Utils.toJson(user, host=self.request.host)
        user_json['logout'] = 'http://%s/logout?redirect=%s' %\
            (self.request.host, self.request.path)
        user_json['institutions'] = []
        for institution in user.institutions:
            user_json['institutions'].append(
                Utils.toJson(institution.get())
            )
        self.response.write(json.dumps(user_json))
