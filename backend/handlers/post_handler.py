# -*- coding: utf-8 -*-
"""Post Handler."""
import json
from google.appengine.ext import ndb

from utils import Utils
from util import login_required
from utils import NotAuthorizedException
from utils import json_response
from util import JsonPatch
from models import Post
from models import SurveyPost
from models import Like
from service_messages import send_message_notification

from . import BaseHandler

__all__ = ['PostHandler']

def getLikes(post, host):
    likes = [Like.make(like, host) for like in post.likes]
    return likes


class PostHandler(BaseHandler):
    """Post Handler."""

    @json_response
    @login_required
    def get(self, user, post_urlsafe):
        """Handle GET Requests."""
        post_key = ndb.Key(urlsafe=post_urlsafe)
        post = post_key.get()

        post_json = post.make(self.request.host)
        post_json['data_comments'] = post.comments
        post_json['data_likes'] = getLikes(post, self.request.host)

        self.response.write(json.dumps(
            post_json
        ))

    @json_response
    @login_required
    def delete(self, user, post_urlsafe):
        """Handle DELETE Requests."""
        """Get the post from the datastore."""
        obj_key = ndb.Key(urlsafe=post_urlsafe)
        post = obj_key.get()

        is_admin = user.has_permission("remove_posts", post.institution.urlsafe())
        is_author = user.has_permission("remove_post", post_urlsafe)

        Utils._assert(not is_admin and not is_author,
                      "The user can not remove this post", NotAuthorizedException)

        post.delete(user)

        if(is_admin and not is_author):
            notification_message = post.create_notification_message(
                user_key=user.key,
                current_institution_key=user.current_institution,
                sender_institution_key=post.institution
            )
            send_message_notification(
                receiver_key=post.author.urlsafe(), 
                notification_type='DELETED_POST',
                entity_key=post.key.urlsafe(),
                message=notification_message, 
                entity=json.dumps(post.make(self.request.host))
            )

    @json_response
    @login_required
    def patch(self, user, post_urlsafe):
        """Handler PATCH Requests."""
        data = self.request.body

        user.check_permission("edit_post",	
                                "User is not allowed to edit this post",	
                               post_urlsafe)

        post = ndb.Key(urlsafe=post_urlsafe).get()

        Utils._assert(not post.can_edit(),
                        "This post cannot be updated",
                        NotAuthorizedException)

        """Apply patch."""
        JsonPatch.load(data, post)

        """Update post."""
        post.put()
