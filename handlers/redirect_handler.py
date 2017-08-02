# -*- coding: utf-8 -*-
"""Redirect Handler."""

from handlers.base_handler import BaseHandler


class RedirectHandler(BaseHandler):
    """Redirect Handler."""

    def get(self):
        """Handle GET request."""
        self.redirect("/app/")
