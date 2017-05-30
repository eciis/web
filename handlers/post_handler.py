# -*- coding: utf-8 -*-
"""Post  Handler."""

from google.appengine.ext import ndb

from utils import Utils
from utils import login_required
from utils import json_response
from json_patch import JsonPatch

from handlers.base_handler import BaseHandler


class PostHandler(BaseHandler):
    """Post Handler."""

    @json_response
    @login_required
    @ndb.transactional(xg=True)
    def post(self, user, url_string):
        """Handle POST Requests.

        This method is only meant to give like in post
        """
        post = ndb.Key(urlsafe=url_string).get()
        user.like_post(post)

    @json_response
    @login_required
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
