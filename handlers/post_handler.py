# -*- coding: utf-8 -*-
"""Post Handler."""

from google.appengine.ext import ndb
import json
from utils import Utils
from utils import login_required
from utils import is_author
from utils import json_response

from handlers.base_handler import BaseHandler


  class PostHandler(BaseHandler):
      """Post Handler."""

    @json_response
    @login_required
    @is_author
    @ndb.transactional(xg=True)
    def delete(self, user, key):
        """Handle DELETE Requests."""
        """Get the post from the datastore."""
        obj_key = ndb.Key(urlsafe=key)
        post = obj_key.get()

        """Set the post's state to deleted."""
       post.state = 'deleted'

        """Update the post, the user and the institution in datastore."""
       post.put()
