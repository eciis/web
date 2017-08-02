# -*- coding: utf-8 -*-
"""Redirect Handler."""

from handlers.base_handler import BaseHandler


class AppRedirectHandler(BaseHandler):
    """Redirect Handler."""

    def get(self):
        """Handle GET request to redirect of /app to /app/ route for client."""
        self.redirect("/app/")
