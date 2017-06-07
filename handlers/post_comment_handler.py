# -*- coding: utf-8 -*-
"""Post Comment Handler."""

import json

from google.appengine.ext import ndb

from utils import login_required
from utils import json_response
from utils import Utils
from utils import NotAuthorizedException

from handlers.base_handler import BaseHandler
from models.post import Comment


def check_permission(user, post, comment_id):
    """Check the user permission to delete comment."""
    institution = post.institution.get()
    comment = post.get_comment(comment_id)
    isNotPostAuthor = post.author != user.key
    isNotAdmin = institution.admin != user.key
    isNotCommentAuthor = comment.author != user.key
    Utils._assert(isNotPostAuthor and
                  isNotAdmin and
                  isNotCommentAuthor,
                  "User not allowed to remove comment", NotAuthorizedException)


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
        comment = Comment.create(data, user.key, post.key)
        post.add_comment(comment)

        self.response.write(json.dumps(Comment.make(comment)))

    @json_response
    @login_required
    @ndb.transactional(xg=True)
    def delete(self, user, url_string, comment_id):
        """Handle Delete Comments requests."""
        post = ndb.Key(urlsafe=url_string).get()
        check_permission(user, post, int(comment_id))
        post.remove_comment(int(comment_id))
