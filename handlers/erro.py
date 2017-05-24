# -*- coding: utf-8 -*-
"""Erro Handler."""

import json

from utils import json_response

from handlers.base import BaseHandler


class ErroHandler(BaseHandler):
    """Error Handler."""

    @json_response
    def get(self):
        """Handle GET Requests."""
        self.response.write(json.dumps({
            "msg": "Not found",
            "status": 404
        }))
