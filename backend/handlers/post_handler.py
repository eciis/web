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

def is_post_author(method):
    """Check if the user is the author of the post."""
    def check_authorization(self, user, url_string, *args):
        obj_key = ndb.Key(urlsafe=url_string)
        post = obj_key.get()
        Utils._assert(post.author != user.key,
                      'User is not allowed to edit this post',
                      NotAuthorizedException)
        method(self, user, url_string, *args)
    return check_authorization


def getLikes(post, host):
    likes = [Like.make(like, host) for like in post.likes]
    return likes


class PostHandler(BaseHandler):
    """Post Handler."""

    @json_response
    @login_required
    def get(self, user, url_string):
        """Handle GET Requests."""
        """Handle GET Requests."""
        post_key = ndb.Key(urlsafe=url_string)
        post = post_key.get()

        assert type(post) in (Post, SurveyPost), "Key is not an Post"
        post_json = post.make(self.request.host)
        post_json['data_comments'] = post.comments
        post_json['data_likes'] = getLikes(post, self.request.host)

        self.response.write(json.dumps(
            post_json
        ))

    @json_response
    @login_required
    def delete(self, user, key):
        """Handle DELETE Requests."""
        """Get the post from the datastore."""
        obj_key = ndb.Key(urlsafe=key)
        post = obj_key.get()

        is_admin = user.has_permission("remove_posts", post.institution.urlsafe())
        is_author = user.has_permission("remove_post", key)

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
    def patch(self, user, url_string):
        """Handler PATCH Requests."""
        data = self.request.body

        try:
            post = ndb.Key(urlsafe=url_string).get()

            Utils._assert(post.has_activity(),
                          "The user can not update this post",
                          NotAuthorizedException)

            user.check_permission("edit_post",
                                  "User is not allowed to edit this post",
                                  url_string)

            """Apply patch."""
            JsonPatch.load(data, post)

            """Update post."""
            post.put()
        except Exception as error:
            self.response.set_status(Utils.FORBIDDEN)
            self.response.write(Utils.getJSONError(
                Utils.FORBIDDEN, error.message))
