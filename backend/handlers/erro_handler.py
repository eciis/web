# -*- coding: utf-8 -*-
"""Erro Handler."""

import json

from utils import json_response

from . import BaseHandler

__all__ = ['ErroHandler']

class ErroHandler(BaseHandler):
    """Error Handler."""

    @json_response
    def get(self):
        """Handle GET Requests."""
        self.response.write(json.dumps({
            "msg": "Not found",
            "status": 404
        }))
        self.response.set_status(404)
