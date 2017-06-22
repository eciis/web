# -*- coding: utf-8 -*-
"""Like Handler."""

import json
from google.appengine.ext import ndb
from utils import login_required
from utils import json_response
from handlers.base_handler import BaseHandler
from models.post import Like


class LikePostHandler(BaseHandler):
    """Like Handler."""

    @json_response
    @login_required
    def get(self, user, url_string):
        """Handler GET Requests."""
        post = ndb.Key(urlsafe=url_string).get()
        likes = [Like.make(like, self.request.host) for like in post.likes]
        self.response.write(json.dumps(likes))

    @login_required
    @ndb.transactional(xg=True)
    def post(self, user, url_string):
        """Handle POST Requests."""
        """This method is only meant to give like in post."""
        post = ndb.Key(urlsafe=url_string).get()
        if not user.is_liked_post(post.key):
            user.like_post(post.key)
            post.like(user.key)

    @login_required
    @ndb.transactional(xg=True)
    def delete(self, user, url_string):
        """Handle DELETE Requests."""
        """This method is only meant to dislike in post."""
        post = ndb.Key(urlsafe=url_string).get()
        if user.is_liked_post(post.key):
            user.dislike_post(post.key)
            post.dislike(user.key)