# -*- coding: utf-8 -*-
"""Post Handler."""

from google.appengine.ext import ndb

from utils import Utils
from utils import login_required
from utils import is_authorized
from utils import NotAuthorizedException
from utils import json_response
from util.json_patch import JsonPatch


from handlers.base_handler import BaseHandler


def is_post_author(method):
    """Check if the user is the author of the post."""
    def check_authorization(self, user, url_string, *args):
        obj_key = ndb.Key(urlsafe=url_string)
        post = obj_key.get()
        Utils._assert(post.author != user.key,
                      'User is not allowed to edit this post',
                      NotAuthorizedException)
        method(self, user, url_string, *args)
    return check_authorization


class PostHandler(BaseHandler):
    """Post Handler."""

    @login_required
    @is_authorized
    def delete(self, user, key):
        """Handle DELETE Requests."""
        """Get the post from the datastore."""
        obj_key = ndb.Key(urlsafe=key)
        post = obj_key.get()

        """Set the post's state to deleted."""
        post.state = 'deleted'

        """Update the post, the user and the institution in datastore."""
        post.put()

    @json_response
    @login_required
    @is_post_author
    def patch(self, user, url_string):
        """Handler PATCH Requests."""
        data = self.request.body

        try:
            post = ndb.Key(urlsafe=url_string).get()

            """Apply patch."""
            JsonPatch.load(data, post)

            """Update post."""
            post.put()
        except Exception as error:
            self.response.set_status(Utils.BAD_REQUEST)
            self.response.write(Utils.getJSONError(
                Utils.BAD_REQUEST, error.message))
