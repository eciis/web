# -*- coding: utf-8 -*-
"""Post Comment Handler."""

import json

from google.appengine.ext import ndb

from utils import login_required
from utils import json_response

from handlers.base_handler import BaseHandler
from models.post import Comment


class PostCommentHandler(BaseHandler):
    """Posr Comment Handler."""

    @json_response
    @login_required
    @ndb.transactional(xg=True)
    def post(self, user, url_string):
        """Handle Post requests."""
        data = json.loads(self.request.body)
        post = ndb.Key(urlsafe=url_string).get()
        comment = Comment.create(data, user.key)
        post.add_comment(comment)
