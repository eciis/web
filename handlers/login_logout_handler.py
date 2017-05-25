# -*- coding: utf-8 -*-
"""Login and Logout Handler."""

from google.appengine.api import users

from handlers.base_handler import BaseHandler


class LoginHandler(BaseHandler):
    """Login Handler."""

    def get(self):
        """Handle GET request."""
        user = users.get_current_user()
        if user is None:
            self.redirect(users.create_login_url("/"))
        else:
            self.redirect("/")


class LogoutHandler(BaseHandler):
    """Logout Handler."""

    def get(self):
        """Handle GET request."""
        user = users.get_current_user()
        if user:
            self.redirect(users.create_logout_url("/"))
        else:
            self.redirect("/login")
