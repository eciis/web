# -*- coding: utf-8 -*-
"""Main Handler."""

import webapp2
import json

from google.appengine.api import users

from models import Institution
from models import Post
from models import User

from utils import Utils


class BaseHandler(webapp2.RequestHandler):
    """Base Handler."""

    def get(self):
        """Handle GET Requests."""
        pass


class MainHandler(BaseHandler):
    """Main Handler."""

    def get(self):
        """Handle GET Requests."""
        user = users.get_current_user()
        if user:
            pass


class LoginHandler(BaseHandler):
    """Login Handler."""

    def get(self):
        """Handle GET Requests."""
        pass


class LogoutHandler(BaseHandler):
    """Logout Handler."""

    def get(self):
        """Handle GET Requests."""
        pass


class InstitutionHandler(BaseHandler):
    """Institution Handler."""

    def get(self):
        """Handle GET Requests."""
        iid = self.request.get('id')
        if iid:
            Utils.get(Institution, int(iid), self.response)
        else:
            Utils.getAll(Institution, self.response)

    def post(self):
        """Handle POST Requests."""
        Utils.postEntity(Institution, self.request, self.response)

    def delete(self, iid):
        """Handle DELETE Requests."""
        inst = Institution.get_by_id(int(iid))
        if inst:
            self.response.write(json.dumps(inst.to_dict()))
            inst.key.delete()
        else:
            self.response.set_status(Utils.NOT_FOUND)


class UserHandler(BaseHandler):
    """User Handler."""

    def get(self):
        """Handle GET Requests."""
        iid = self.request.get('id')
        if iid:
            Utils.get(User, int(iid), self.response)
        else:
            Utils.getAll(User, self.response)

    def post(self):
        """Handle POST Requests."""
        Utils.postEntity(User, self.request, self.response)


class PostHandler(BaseHandler):
    """Post Handler."""

    def get(self):
        """Handle GET Requests."""
        iid = self.request.get('id')
        if iid:
            Utils.get(Post, int(iid), self.response)
        else:
            Utils.getAll(Post, self.response)

    def post(self):
        """Handle POST Requests."""
        Utils.postEntity(Post, self.request, self.response)


class ErroHandler(BaseHandler):
    """Error Handler."""

    def get(self):
        """Handle GET Requests."""
        self.response.write("Not Found")

app = webapp2.WSGIApplication([
    ("/api", MainHandler),
    ("/api/login", LoginHandler),
    ("/api/logout", LogoutHandler),
    ("/api/institution", InstitutionHandler),
    ("/api/institution/(.*)", InstitutionHandler),
    ("/api/post", PostHandler),
    ("/api/user", UserHandler),
    ("/api/.*", ErroHandler),
], debug=True)
