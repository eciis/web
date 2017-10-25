# -*- coding: utf-8 -*-
"""Like Handler."""

import json
from google.appengine.ext import ndb
from utils import login_required
from utils import json_response
from handlers.base_handler import BaseHandler
from models.post import Like
from custom_exceptions.notAuthorizedException import NotAuthorizedException
from service_entities import send_post_notification
from service_messages import send_message_notification
from utils import Utils


class LikeException(Exception):
    """Like Exception."""

    def __init__(self, message=None):
        """Init method."""
        super(LikeException, self).__init__(
            message or 'User already made this action in publication.')


def send_like_notification(sender, receiver_key, entity_type, entity_key):
    """Send notification of like comments or post."""
    message = {'type': entity_type, 'from': sender.name.encode('utf8')}
    send_message_notification(
        receiver_key,
        json.dumps(message),
        entity_type,
        entity_key)


class LikeHandler(BaseHandler):
    """Like Handler."""

    @json_response
    @login_required
    def get(self, user, post_key, comment_id=None):
        """Handler GET Requests."""
        post = ndb.Key(urlsafe=post_key).get()
        if comment_id:
            comment = post.get_comment(comment_id)
            likes = comment.get('likes')
        else:
            likes = [Like.make(like, self.request.host) for like in post.likes]

        self.response.write(json.dumps(likes))

    @json_response
    @login_required
    @ndb.transactional(xg=True)
    def post(self, user, post_key, comment_id=None, reply_id=None):
        """Handle POST Requests."""
        """This method is only meant to give like in post."""
        post = ndb.Key(urlsafe=post_key).get()
        institution = post.institution.get()
        Utils._assert(institution.state == 'inactive',
                      "The institution has been deleted", NotAuthorizedException)
        entity_type = 'LIKE_POST'

        if comment_id:
            comment = post.get_comment(comment_id)
            entity_type = 'LIKE_COMMENT'
            if reply_id:
                comment = comment.get('replies').get(reply_id)

            likes = comment.get('likes')

            Utils._assert(user.key.urlsafe() in likes,
                      "User already liked this comment", NotAuthorizedException)
            likes.append(user.key.urlsafe())
            post.put()

            isAuthorComment = comment['author_key'] != user.key.urlsafe()
            if comment and isAuthorComment:
                send_like_notification(user, comment['author_key'], entity_type, post.key.urlsafe())
        else:
            Utils._assert(user.is_liked_post(post.key),
                      "User already liked this publication", NotAuthorizedException)
            user.like_post(post.key)
            post.like(user.key)

            send_post_notification(
                post,
                user,
                entity_type
            )

    @json_response
    @login_required
    @ndb.transactional(xg=True)
    def delete(self, user, post_key, comment_id=None, reply_id=None):
        """Handle DELETE Requests."""
        """This method is only meant to dislike in post."""
        post = ndb.Key(urlsafe=post_key).get()
        institution = post.institution.get()
        Utils._assert(institution.state == 'inactive',
                      "The institution has been deleted", NotAuthorizedException)
        if comment_id:
            comment = post.get_comment(comment_id)
            if reply_id:
                comment = comment.get('replies').get(reply_id)

            likes = comment.get('likes')

            Utils._assert(user.key.urlsafe() not in likes,
                      "User hasn't liked this comment", LikeException)
            likes.remove(user.key.urlsafe())
            post.put();
        else:
            Utils._assert(not user.is_liked_post(post.key),
                      "User hasn't liked this publication.", LikeException)
            user.dislike_post(post.key)
            post.dislike(user.key)
