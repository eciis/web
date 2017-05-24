# -*- coding: utf-8 -*-
"""Base Handler."""

import webapp2
import json
import logging

from utils import json_response


class BaseHandler(webapp2.RequestHandler):
    """Base Handler."""

    @json_response
    def handle_exception(self, exception, debug):
        """Handle exception."""
        logging.error(str(exception))
        self.response.set_status(500)
        self.response.write(json.dumps({
            "msg": "Error! %s" % str(exception)
        }))
