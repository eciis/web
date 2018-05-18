# -*- coding: utf-8 -*-
"""Post Comment Handler."""

import json

from google.appengine.ext import ndb

from util.login_service import login_required
from utils import json_response
from utils import Utils
from service_entities import enqueue_task
from custom_exceptions.notAuthorizedException import NotAuthorizedException
from custom_exceptions.entityException import EntityException

from . import BaseHandler
from models import Comment

__all__ = ['PostCommentHandler']

def check_permission(user, institution, post, comment):
    """Check the user permission to delete comment."""
    is_not_post_author = post.author != user.key
    is_not_admin = institution.admin != user.key
    is_not_comment_author = comment.get('author_key') != user.key.urlsafe()
    Utils._assert(is_not_post_author and
                  is_not_admin and
                  is_not_comment_author,
                  "User not allowed to remove comment", NotAuthorizedException)


class PostCommentHandler(BaseHandler):
    """Post Comment Handler."""

    @json_response
    @login_required
    def get(self, user, post_key):
        """Handle Get Comments requests."""
        post = ndb.Key(urlsafe=post_key).get()
        post.make_comments()
        self.response.write(json.dumps(post.comments))

    @json_response
    @login_required
    def post(self, user, post_key):
        """Handle Post Comments requests."""
        body = json.loads(self.request.body)
        comment_data = body['commentData']
        post = ndb.Key(urlsafe=post_key).get()

        Utils._assert(post.state == 'deleted',
                      "This post has been deleted", EntityException)

        comment = Comment.create(comment_data, user)
        post.add_comment(comment)
        entity_type = 'COMMENT'

        user_is_the_post_author = post.author == user.key
        if(not user_is_the_post_author):
            params = {
                'receiver_key': post.author.urlsafe(),
                'sender_key': user.key.urlsafe(),
                'entity_key': post.key.urlsafe(),
                'entity_type': entity_type,
                'current_institution': user.current_institution.urlsafe(),
                'sender_institution_key': post.institution.urlsafe()
            }
            enqueue_task('post-notification', params)

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
        has_activity = len(comment.get('replies')) > 0 or len(comment.get('likes')) > 0
        
        Utils._assert(has_activity,
                      "Comment with activity can't be removed", NotAuthorizedException)
        Utils._assert(has_activity,
                      "Comment with activity can't be removed", NotAuthorizedException)

        check_permission(user, institution, post, comment)
        post.remove_comment(comment)

        self.response.write(json.dumps(comment))
