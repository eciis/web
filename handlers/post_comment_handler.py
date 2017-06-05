# -*- coding: utf-8 -*-
"""Post Comment Handler."""

import json
import datetime

from google.appengine.ext import ndb

from utils import Utils
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
        try:
            data = json.loads(self.request.body)
            post = ndb.Key(urlsafe=url_string).get()
            comment = Comment.create(data, user.key)
            post.add_comment(comment)

            self.response.write(json.dumps(Comment.make(comment)))
        except Exception as error:
            self.response.set_status(Utils.BAD_REQUEST)
            self.response.write(Utils.getJSONError(
                Utils.BAD_REQUEST, error.message))

    @json_response
    @login_required
    @ndb.transactional(xg=True)
    def delete(self, user, url_string, comment_id):
        """Handle Delete requests."""
        try:
            post = ndb.Key(urlsafe=url_string).get()
            post.remove_comment(comment_id)

        except Exception as error:
            self.response.set_status(Utils.BAD_REQUEST)
            self.response.write(Utils.getJSONError(
                Utils.BAD_REQUEST, error.message))
