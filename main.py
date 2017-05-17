# -*- coding: utf-8 -*-
"""Main Handler."""

import webapp2
import json

from google.appengine.api import users

from models import Institution
from models import Post
from models import User

from utils import Utils


def login_required(method):
    """Handle required login."""
    def login(self, *args):
        user = users.get_current_user()
        if user is None:
            self.response.write(json.dumps({
                'msg': 'Auth needed',
                'login_url': 'http://%s/login' % self.request.host
            }))
            self.response.set_status(401)
            return
        method(self, user, *args)
    return login


def json_response(method):
    """Add content type header to the response."""
    def response(self, *args):
        self.response.headers[
            'Content-Type'] = 'application/json; charset=utf-8'
        method(self, *args)
    return response


class BaseHandler(webapp2.RequestHandler):
    """Base Handler."""

    def get(self):
        """Handle GET Requests."""
        pass


class MainHandler(BaseHandler):
    """Main Handler."""

    @json_response
    @login_required
    def get(self, user):
        """Handle HTTP GET request."""
        self.response.write(json.dumps({
            'email': user.email(),
            'id': user.user_id(),
            'nickname': user.nickname(),
            'logout': 'http://%s/logout?redirect=%s' %
            (self.request.host, self.request.path)
        }))

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


class UserTimelineHandler(BaseHandler):
    #get posts of all institutions that the user follow
    def get(self, userId):
        user = User.get_by_id(int(userId))
        
        queryPosts = Post.query(Post.institution.IN(user.follows))

        posts = []
        for post in queryPosts.iter():
            posts.append(post)
        self.response.write(posts)


class ErroHandler(BaseHandler):
    """Error Handler."""

    def get(self):
        """Handle GET Requests."""
        self.response.write("Not Found")

app = webapp2.WSGIApplication([
    ("/login", LoginHandler),
    ("/logout", LogoutHandler),
    ("/api", MainHandler),
    ("/api/institution", InstitutionHandler),
    ("/api/institution/(.*)", InstitutionHandler),
    ("/api/post", PostHandler),
    ("/api/user/(\d+)/timeline", UserTimelineHandler),
    ("/api/user", UserHandler),
    ("/api/.*", ErroHandler),
], debug=True)
