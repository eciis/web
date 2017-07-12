# -*- coding: utf-8 -*-
"""Post Handler."""

from google.appengine.ext import ndb

from utils import Utils
from utils import login_required
from utils import is_authorized
from utils import json_response
from util.json_patch import JsonPatch


from handlers.base_handler import BaseHandler


class PostHandler(BaseHandler):
    """Post Handler."""

    @login_required
    @is_authorized
    def delete(self, user, key):
        """Handle DELETE Requests."""
        """Get the post from the datastore."""
        obj_key = ndb.Key(urlsafe=key)
        post = obj_key.get()

        """Set the informations about post."""
        post.delete(user)


    """
    TODO: Test is_authorized
    @author: Andre L Abrantes - 23-06-2017
    """
    @json_response
    @login_required
    @is_authorized
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
