# -*- coding: utf-8 -*-
"""Post Comment Handler."""

import json

from google.appengine.ext import ndb

from utils import login_required
from utils import json_response

from handlers.base_handler import BaseHandler
from models.post import Comment


class PostCommentHandler(BaseHandler):
    """Post Comment Handler."""

    @json_response
    @login_required
    def get(self, user, url_string):
        """Handle Get Comments requests."""
        post = ndb.Key(urlsafe=url_string).get()
        comments = [Comment.make(comment)
                    for comment in post.comments]
        self.response.write(json.dumps(comments))

    @json_response
    @login_required
    @ndb.transactional(xg=True)
    def post(self, user, url_string):
        """Handle Post Comments requests."""
        data = json.loads(self.request.body)
        post = ndb.Key(urlsafe=url_string).get()
        comment = Comment.create(data, user.key)
        post.add_comment(comment)

        self.response.write(json.dumps(Comment.make(comment)))

    @json_response
    @login_required
    @ndb.transactional(xg=True)
    def delete(self, user, url_string, comment_id):
        """Handle Delete Comments requests."""
        post = ndb.Key(urlsafe=url_string).get()
        post.remove_comment(int(comment_id))
