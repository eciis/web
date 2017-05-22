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
        user_json = Utils.toJson(user, host=self.request.host)
        user_json['logout'] = 'http://%s/logout?redirect=%s' %\
            (self.request.host, self.request.path)
        self.response.write(json.dumps(user_json))


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

    @json_response
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
        data = json.loads(self.request.body)
        institution_key = data['institution']

        if (user.key in institution_key.get().members):
            post = Post()
            post.title = data['title']
            post.headerImage = data.get('headerImage')
            post.text = data['text']
            post.author = user.key

            post.institution = institution_key
            post.comments = []
            post.put()

            """ Update Institution."""
            institution = post.institution.get()
            institution.posts.append(post.key)
            institution.put()

            """ Update User."""
            user = post.author.get()
            user.posts.append(post.key)
            user.put()

            self.response.write(json.dumps(
                Utils.toJson(post, host=self.request.host)
            ))
        else:
            """TODO: Fix to no not change the view to /login.
                @author: Mayza Nunes 19/05/2017
            """
            self.response.set_status(Utils.FORBIDDEN)
            self.response.write(Utils.getJSONError(
                Utils.FORBIDDEN, "User is not a member of this Institution"))


class UserTimelineHandler(BaseHandler):
    """ Get posts of all institutions that the user follow."""
    @json_response
    @login_required
    def get(self, user):
        """TODO: Change to get a timeline without query.
            @author: Mayza Nunes 18/05/2017
        """
        queryPosts = Post.query(Post.institution.IN(
            user.follows)).order(Post.publication_date)

        array = []
        for post in queryPosts:
            value = post.publication_date.strftime("%d-%m-%Y")
            array.append(({
                'title': post.title,
                'text': post.text,
                'author': post.author.get().name,
                'author_img': post.author.get().photo_url,
                'institution_name': post.institution.get().name,
                'institution_image': post.institution.get().image_url,
                'likes': post.likes,
                'headerImage': post.headerImage,
                'state': post.state,
                'comments': post.comments,
                'publication_date': value
            }))
        self.response.write(json.dumps(array))


class ErroHandler(BaseHandler):
    """Error Handler."""

    def get(self):
        """Handle GET Requests."""
        self.response.write("Not Found")


class GetKeyHandler(BaseHandler):
    """Handle generic key requests."""

    @json_response
    @login_required
    def get(self, user, url_string):
        """GET request passing url_safe."""
        obj_key = ndb.Key(urlsafe=url_string)
        obj = obj_key.get()
        self.response.write(json.dumps(
            Utils.toJson(obj, host=self.request.host)
        ))

app = webapp2.WSGIApplication([
    ("/api", MainHandler),
    ("/api/institution", InstitutionHandler),
    ("/api/institution/(.*)", InstitutionHandler),
    ("/api/key/(.*)", GetKeyHandler),
    ("/api/post", PostHandler),
    ("/api/user", UserHandler),
    ("/api/user/timeline", UserTimelineHandler),
    ("/login", LoginHandler),
    ("/logout", LogoutHandler),
    ("/api/.*", ErroHandler),
], debug=True)
