# -*- coding: utf-8 -*-
"""Like Handler."""

import json
from google.appengine.ext import ndb
from util import login_required
from utils import json_response
from . import BaseHandler
from models import Like
from custom_exceptions import NotAuthorizedException
from custom_exceptions import EntityException
from service_entities import enqueue_task
from service_messages import send_message_notification
from utils import Utils

__all__ = ['LikeHandler']

class LikeException(Exception):
    """Like Exception."""

    def __init__(self, message=None):
        """Init method."""
        super(LikeException, self).__init__(
            message or 'User already made this action in publication.')


class LikeHandler(BaseHandler):
    """Like Handler."""

    @json_response
    @login_required
    def get(self, user, post_key, comment_id=None, reply_id=None):
        """Handler GET Requests."""
        post = ndb.Key(urlsafe=post_key).get()
        if comment_id:
            comment = post.get_comment(comment_id)
            if(reply_id):
                reply = comment.get('replies').get(reply_id)
                likes = reply.get('likes')
            else:
                likes = comment.get('likes')
        else:
            likes = [Like.make(like, self.request.host) for like in post.likes]

        self.response.write(json.dumps(likes))

    @json_response
    @login_required
    def post(self, user, post_key, comment_id=None, reply_id=None):
        """Handle POST Requests."""
        """This method is only meant to give like in post, comment or reply and send notification."""
        post = ndb.Key(urlsafe=post_key).get()
        Utils._assert(post.state == 'deleted',
                      "This post has been deleted", EntityException)
        if comment_id:            
            comment = post.like_comment(user, comment_id, reply_id)

            notification_type = 'LIKE_COMMENT'
            user_is_the_author = comment['author_key'] == user.key.urlsafe()
            if not user_is_the_author:
                receiver_key = comment['author_key']
                notification_message = post.create_notification_message(
                    user_key=user.key,
                    current_institution_key=user.current_institution, 
                    sender_institution_key=post.institution
                )
                send_message_notification(
                    receiver_key=receiver_key,
                    notification_type=notification_type, 
                    entity_key=post_key,
                    message=notification_message
                ) 
        else: 
            post = post.like(user.key)

            entity_type = 'LIKE_POST'
            params = {
                    'receiver_key': post.author.urlsafe(),
                    'sender_key': user.key.urlsafe(),
                    'entity_key': post.key.urlsafe(),
                    'entity_type': entity_type,
                    'current_institution': user.current_institution.urlsafe(),
                    'sender_institution_key': post.institution.urlsafe(),
                    'field': 'subscribers'
                }

            enqueue_task('multiple-notification', params)

            is_first_like = post.get_number_of_likes() == 1
            if is_first_like:
                enqueue_task('send-push-notification', {
                    'type': entity_type,
                    'receivers': [subscriber.urlsafe() for subscriber in post.subscribers],
                    'entity': post.key.urlsafe()
                })

    @json_response
    @login_required
    def delete(self, user, post_key, comment_id=None, reply_id=None):
        """Handle DELETE Requests."""
        """This method is only meant to dislike in post."""
        post = ndb.Key(urlsafe=post_key).get()
        institution = post.institution.get()

        Utils._assert(not institution.is_active(),
                      "This institution is not active", NotAuthorizedException)
        
        if comment_id:
            comment = post.get_comment(comment_id)
            if reply_id:
                comment = comment.get('replies').get(reply_id)

            likes = comment.get('likes')

            Utils._assert(user.key.urlsafe() not in likes,
                      "User hasn't liked this comment.", LikeException)

            @ndb.transactional(retries=10, xg=True)
            def remove_like(likes, user, post):
                likes.remove(user.key.urlsafe())
                post.put()
            remove_like(likes, user, post)
        else:
            Utils._assert(not user.is_liked_post(post.key),
                      "User hasn't liked this publication.", LikeException)

            @ndb.transactional(retries=10, xg=True)
            def remove_like(user, post):
                user.dislike_post(post.key)
                post.dislike(user.key)
            remove_like(user, post)
