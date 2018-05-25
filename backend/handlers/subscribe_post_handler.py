# -*- coding: utf-8 -*-
"""Subscribe Post Handler."""

from google.appengine.ext import ndb
from utils import Utils
from util import login_required
from utils import json_response

from . import BaseHandler

from custom_exceptions import NotAuthorizedException

__all__ = ['SubscribePostHandler']

class SubscribePostHandler(BaseHandler):
    """Subscribe Post Handler."""

    @json_response
    @login_required
    @ndb.transactional(xg=True)
    def post(self, user, post_urlsafe):
        """Handle POST Requests.
        This method, if the post is published,
        subscribes the user to the post whose key
        is post_urlsafe. Thus, the user will receive 
        notifications warning about actions in this post.
        """
        post = ndb.Key(urlsafe=post_urlsafe).get()

        Utils._assert(post.state != 'published',
                      'The post is unavailable to this procedure',
                      NotAuthorizedException)

        post.add_subscriber(user)

    @json_response
    @login_required
    @ndb.transactional(xg=True)
    def delete(self, user, post_urlsafe):
        """Handle Delete Requests.
        This method removes the user from the
        post's subscribers list. The post has 
        post_urlsafe as its key representation
        and this operation is aborted if the post
        is not published or the user is the post's author.
        """
        post = ndb.Key(urlsafe=post_urlsafe).get()

        Utils._assert(post.state != 'published',
                      'The post is unavailable to this procedure',
                      NotAuthorizedException)
        Utils._assert(post.author == user.key,
                      'The user must be interested at his post',
                      NotAuthorizedException)

        post.remove_subscriber(user)
