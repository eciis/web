# -*- coding: utf-8 -*-
"""Post Comment Handler."""

import json

from google.appengine.ext import ndb

from utils import login_required
from utils import json_response
from utils import Utils
from service_messages import send_message_notification
from service_entities import send_post_notification
from custom_exceptions.notAuthorizedException import NotAuthorizedException
from custom_exceptions.entityException import EntityException

from handlers.base_handler import BaseHandler
from models.post import Comment


def check_permission(user, institution, post, comment):
    """Check the user permission to delete comment."""
    isNotPostAuthor = post.author != user.key
    isNotAdmin = institution.admin != user.key
    isNotCommentAuthor = comment.get('author_key') != user.key.urlsafe()
    Utils._assert(isNotPostAuthor and
                  isNotAdmin and
                  isNotCommentAuthor,
                  "User not allowed to remove comment", NotAuthorizedException)


class PostCommentHandler(BaseHandler):
    """Post Comment Handler."""

    @json_response
    @login_required
    def get(self, user, post_key):
        """Handle Get Comments requests."""
        post = ndb.Key(urlsafe=post_key).get()

        self.response.write(json.dumps(post.comments))

    @json_response
    @login_required
    @ndb.transactional(xg=True)
    def post(self, user, post_key):
        """Handle Post Comments requests."""
        data = json.loads(self.request.body)
        post = ndb.Key(urlsafe=post_key).get()
        Utils._assert(post.state == 'deleted',
                      "This post has been deleted", EntityException)
        comment = Comment.create(data, user)
        post.add_comment(comment)
        entity_type = 'COMMENT'

        send_post_notification(
            post.author.urlsafe(),
            user.key.urlsafe(),
            user.name,
            post.key.urlsafe(),
            entity_type
        )

        self.response.write(json.dumps(Utils.toJson(comment)))

    @json_response
    @login_required
    @ndb.transactional(xg=True)
    def delete(self, user, post_key, comment_id):
        """Handle Delete Comments requests."""
        post = ndb.Key(urlsafe=post_key).get()
        institution = post.institution.get()
        Utils._assert(institution.state == 'inactive',
                      "The institution has been deleted", NotAuthorizedException)
        Utils._assert(post.state == 'deleted',
                      "Can not delete comment in deleted post", NotAuthorizedException)
        comment = post.get_comment(comment_id)

        hasActivity = len(comment.get('replies')) > 0 or len(comment.get('likes')) > 0
        Utils._assert(hasActivity,
                      "Comment with activity can't be removed", NotAuthorizedException)
        Utils._assert(hasActivity,
                      "Comment with activity can't be removed", NotAuthorizedException)

        check_permission(user, institution, post, comment)
        post.remove_comment(comment)

        self.response.write(json.dumps(comment))
