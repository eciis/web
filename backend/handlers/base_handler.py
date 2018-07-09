# -*- coding: utf-8 -*-
"""Base Handler."""

import webapp2
import json
import logging

from utils import json_response

__all__ = ['BaseHandler']

class BaseHandler(webapp2.UserRequestHandler):
    """Base Handler."""

    def decorateHeaders(self):
        """Decorates headers for the current request."""
        self.response.headers['Access-Control-Allow-Origin'] = '*'
        self.response.headers['Access-Control-Allow-Headers'] = 'X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method, Authorization, Institution-Authorization'
        self.response.headers['Access-Control-Allow-Methods'] = 'POST, GET, PUT, DELETE, PATCH'

    def options(self, *args):
        """Default OPTIONS handler for the entire app."""
        self.decorateHeaders()

    @json_response
    def handle_exception(self, exception, debug):
        """Handle exception."""
        logging.exception(str(exception))
        self.response.set_status(500)
        self.response.write(json.dumps({
            "msg": "Error! %s" % str(exception)
        }))
