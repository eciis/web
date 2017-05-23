# -*- coding: utf-8 -*-
"""Main Handler."""

import webapp2
import json
import logging

from google.appengine.api import users
from google.appengine.ext import ndb

from models import Institution
from models import Post

from utils import Utils
from utils import login_required
from utils import json_response


class BaseHandler(webapp2.RequestHandler):
    """Base Handler."""

    @json_response
    def handle_exception(self, exception, debug):
        """Handle exception."""
        logging.error(str(exception))
        self.response.set_status(500)
        self.response.write(json.dumps({
            "msg": "Error! %s" % str(exception)
        }))


class MainHandler(BaseHandler):
    """Main Handler."""

    @json_response
    @login_required
    def get(self, user):
        """Handle HTTP GET request."""
        user_json = Utils.toJson(user, host=self.request.host)
        user_json['logout'] = 'http://%s/logout?redirect=%s' %\
            (self.request.host, self.request.path)
        user_json['institutions'] = []
        for institution in user.institutions:
            user_json['institutions'].append(
                Utils.toJson(institution.get())
            )
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

    @json_response
    @login_required
    def get(self, user, url_string):
        """Handle GET Requests."""
        obj_key = ndb.Key(urlsafe=url_string)
        obj = obj_key.get()
        assert type(obj) is Institution, "Key is not an Institution"
        self.response.write(json.dumps(
            Utils.toJson(obj, host=self.request.host)
        ))


class UserHandler(BaseHandler):
    """User Handler."""

    @json_response
    @login_required
    def get(self, user):
        """Handle GET Requests."""
        self.response.write(json.dumps(
            Utils.toJson(user, host=self.request.host)
        ))


class PostHandler(BaseHandler):
    """Post Handler."""

    @json_response
    @login_required
    def get(self, user):
        """Handle GET Requests."""
        posts = Utils.toJson(user.posts, host=self.request.host)
        self.response.write(json.dumps(posts))

    @json_response
    @login_required
    @ndb.transactional(xg=True)
    def post(self, user):
        """Handle POST Requests."""
        data = json.loads(self.request.body)
        institution_key = ndb.Key(urlsafe=data['institution'])

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
            author = post.author.get()
            author.posts.append(post.key)
            author.put()

            post_json = Utils.toJson(post, host=self.request.host)

            post_json['author'] = author.name
            post_json['author_img'] = author.photo_url
            post_json['institution_name'] = institution.name
            post_json['institution_image'] = institution.image_url

            self.response.write(json.dumps(post_json))
        else:
            """TODO: Fix to no not change the view to /login.

            @author: Mayza Nunes 19/05/2017
            """
            self.response.set_status(Utils.FORBIDDEN)
            self.response.write(Utils.getJSONError(
                Utils.FORBIDDEN, "User is not a member of this Institution"))


class UserTimelineHandler(BaseHandler):
    """Get posts of all institutions that the user follow."""

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
            value = post.publication_date.isoformat()
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

    @json_response
    def get(self):
        """Handle GET Requests."""
        self.response.write(json.dumps({
            "msg": "Not found",
            "status": 404
        }))


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
    ("/api/institution/(.*)", InstitutionHandler),
    ("/api/key/(.*)", GetKeyHandler),
    ("/api/post", PostHandler),
    ("/api/user", UserHandler),
    ("/api/user/timeline", UserTimelineHandler),
    ("/login", LoginHandler),
    ("/logout", LogoutHandler),
    ("/api/.*", ErroHandler),
], debug=True)
