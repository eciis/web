# -*- coding: utf-8 -*-
"""Reply Comment Handler."""

import json

from google.appengine.ext import ndb

from util import login_required
from utils import json_response
from utils import Utils
from service_messages import send_message_notification
from custom_exceptions.notAuthorizedException import NotAuthorizedException
from custom_exceptions.entityException import EntityException

from . import BaseHandler
from models import Comment

__all__ = ['ReplyCommentHandler']

def check_permission(user, institution, post, comment):
    """Check the user permission to delete comment."""
    isNotPostAuthor = post.author != user.key
    isNotAdmin = institution.admin != user.key
    isNotCommentAuthor = comment.get('author_key') != user.key.urlsafe()
    Utils._assert(isNotPostAuthor and
                  isNotAdmin and
                  isNotCommentAuthor,
                  "User not allowed to remove comment", NotAuthorizedException)


class ReplyCommentHandler(BaseHandler):
    """Post Comment Handler."""

    @json_response
    @login_required
    def get(self, user, post_key, comment_id):
        """Handle Get Comments requests."""
        post = ndb.Key(urlsafe=post_key).get()
        replies = post.get_comment(comment_id).get('replies')
        self.response.write(json.dumps(replies))

    @json_response
    @login_required
    def post(self, user, post_key, comment_id):
        """Handle Post Comments requests."""
        data = json.loads(self.request.body)
        reply_data = data['replyData']
        post = ndb.Key(urlsafe=post_key).get()
        institution = post.institution.get()

        Utils._assert(institution.state == 'inactive',
                      "The institution has been deleted", NotAuthorizedException)
        Utils._assert(post.state == 'deleted',
                      "This post has been deleted", EntityException)

        reply = Comment.create(reply_data, user)
        post.reply_comment(reply, comment_id)

        notification_message = post.create_notification_message(
            user_key=user.key,
            current_institution_key=user.current_institution,
            sender_institution_key=post.institution
        )
        notification_type = 'COMMENT'

        if (post.author != user.key):
            send_message_notification(
                receiver_key=post.author.urlsafe(),
                notification_type=notification_type,
                entity_key=post.key.urlsafe(),
                message=notification_message
            )

        comment = post.get_comment(comment_id)
        notification_type = "REPLY_COMMENT"

        if (comment.get('author_key') != user.key.urlsafe()):
            send_message_notification(
                receiver_key=comment.get('author_key'),
                notification_type=notification_type,
                entity_key=post.key.urlsafe(),
                message=notification_message
            )

        self.response.write(json.dumps(Utils.toJson(reply)))

    @json_response
    @login_required
    @ndb.transactional(xg=True)
    def delete(self, user, post_key, comment_id, reply_id):
        """Handle Delete Comments requests."""
        post = ndb.Key(urlsafe=post_key).get()
        institution = post.institution.get()
        
        Utils._assert(institution.state == 'inactive',
                      "The institution has been deleted", NotAuthorizedException)
        
        comment = post.get_comment(comment_id)
        replies = comment.get('replies')

        Utils._assert(len(replies.get(reply_id).get('likes')) > 0,
                      "Comment with activity can't be removed", NotAuthorizedException)

        check_permission(user, institution, post, replies.get(reply_id))

        del replies[reply_id]
        post.put()
        self.response.write(json.dumps(replies.get(reply_id)))
