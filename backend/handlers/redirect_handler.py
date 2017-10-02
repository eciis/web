# -*- coding: utf-8 -*-
"""Redirect Handler."""

from handlers.base_handler import BaseHandler


class AppRedirectHandler(BaseHandler):
    """Redirect Handler."""

    def get(self):
        print ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"
        """Handle GET request to redirect from /app route to /app/ for client."""
        self.redirect("/app/")
