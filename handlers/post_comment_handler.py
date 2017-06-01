# -*- coding: utf-8 -*-
"""Post Comment Handler."""

from google.appengine.ext import ndb

from utils import login_required
from utils import json_response

from handlers.base_handler import BaseHandler
from models.post import Comment


class PostCommentHandler(BaseHandler):
    """Posr Comment Handler."""

    @login_required
    @json_response
    @ndb.transactional(xg=True)
    def post(self, user, url_string):
        """Handle Post requests."""
        data = self.request.body
        post = ndb.Key(urlsafe=url_string).get()
        comment = Comment.create(data, user, post)
        comment.put()
        post.add_comment(comment)

    def get(self, user, url_string):
        """Handle Get requests."""
        pass
