# -*- coding: utf-8 -*-
"""Main Handler."""

import webapp2
import json

from google.appengine.api import users
from google.appengine.ext import ndb

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
        user = User.get_by_email(user.email())
        if user is None:
            self.response.write(json.dumps({
                'msg': 'Forbidden',
                'login_url': 'http://%s/login' % self.request.host
            }))
            self.response.set_status(403)
            self.redirect("/logout")
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
            'email': user.email,
            'nickname': user.name,
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

    @login_required
    @ndb.transactional(xg=True)
    def post(self, user):
        """Handle POST Requests."""
        #Utils.postEntity(Post, self.request, self.response)
        data = json.loads(self.request.body)

        post = Post()
        post.title = data['title']
        post.headerImage = data.get('headerImage')
        post.text = data['text']
        post.author = user.key
        """TODO see how get the institution that the user stay work now."""
        post.institution = user.institutions[0]
        post.comments = []
        post.put()

        """ Update Institution."""
        institution = post.institution.get()
        institution.posts.append(post.key)
        institution.put()

        """Update User."""
        user = post.author.get()
        user.posts.append(post.key)
        user.put()

        self.response.write('{"iid": "%d"}' % post.key.integer_id())
        self.response.set_status(201)


class UserTimelineHandler(BaseHandler):
    """Get posts of all institutions that the user follow."""

    @json_response
    @login_required
    def get(self, user):
        queryPosts = Post.query(Post.institution.IN(user.follows)).order(Post.publication_date)

        dataPosts = [Utils.toJson(post) for post in queryPosts]
       
        self.response.write(json.dumps(dataPosts))


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
    ("/api/user/timeline", UserTimelineHandler),
    ("/api/user", UserHandler),
    ("/api/.*", ErroHandler),
], debug=True)
