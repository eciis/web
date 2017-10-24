# -*- coding: utf-8 -*-
"""Post  Interest Handler."""

from google.appengine.ext import ndb
from utils import Utils
from utils import login_required
from utils import json_response

from handlers.base_handler import BaseHandler

from custom_exceptions.notAuthorizedException import NotAuthorizedException


class PostInterestHandler(BaseHandler):
    """Post  Interest Handler."""

    @json_response
    @login_required
    @ndb.transactional(xg=True)
    def post(self, user, post_key):
        """Handle POST Requests."""
        post = ndb.Key(urlsafe=post_key).get()

        Utils._assert(post.state != 'published',
                      'The post is unavailable to this procedure',
                      NotAuthorizedException)

        post.add_interested_user(user)
        post.put()

    @json_response
    @login_required
    @ndb.transactional(xg=True)
    def delete(self, user, post_key):
        """Handle POST Requests."""
        post = ndb.Key(urlsafe=post_key).get()

        Utils._assert(post.state != 'published',
                      'The post is unavailable to this procedure',
                      NotAuthorizedException)
        Utils._assert(post.author == user.key,
                      'The user must be interested at his post',
                      NotAuthorizedException)

        post.remove_interested_user(user)
        post.put()
