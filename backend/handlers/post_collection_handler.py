# -*- coding: utf-8 -*-
"""Post  Collection Handler."""

from google.appengine.ext import ndb
import json
from utils import Utils
from util import login_required
from utils import json_response

from . import BaseHandler
from models import Post
from models import PostFactory
from service_messages import send_message_notification
from service_entities import enqueue_task

from custom_exceptions import NotAuthorizedException

__all__ = ['PostCollectionHandler']

def get_permission(data):
        """Return permission according to the type of data."""
        if(PostFactory.get_type(data) == 'SURVEY_POST'):
            return 'publish_survey'
        else:
            return 'publish_post'


class PostCollectionHandler(BaseHandler):
    """Post  Collection Handler."""

    @json_response
    @login_required
    def get(self, user):
        """Handle GET Requests."""
        posts = Utils.toJson(user.posts, host=self.request.host)
        self.response.write(json.dumps(posts))

    @json_response
    @login_required
    def post(self, user):
        """Handle POST Requests."""
        body = json.loads(self.request.body)
        post_data = body['post']
        institution_key = post_data['institution']

        institution = ndb.Key(urlsafe=institution_key).get()

        Utils._assert(not institution.is_active(),
                      "This institution is not active",
                      NotAuthorizedException)

        permission = get_permission(post_data)

        user.key.get().check_permission(permission,
                              "You don't have permission to publish post.",
                              institution_key)

        @ndb.transactional(xg=True, retries=10)
        def create_post(post_data, user, institution):
            created_post = PostFactory.create(post_data, user.key, institution.key)
            user.add_post(created_post)

            institution.add_post(created_post)

            return created_post

        post = create_post(post_data, user, institution)

        entity_type = PostFactory.get_type(post_data)

        params = {
            'sender_key': user.key.urlsafe(),
            'entity_key': post.key.urlsafe(),
            'entity_type': entity_type,
            'institution_key': post.institution.urlsafe(),
            'current_institution': user.current_institution.urlsafe()
        }
  
        enqueue_task('notify-followers', params)

        if(post.shared_post):
            shared_post = post.shared_post.get()
            entity_type = 'SHARED_POST'
            params = {
                'receiver_key': shared_post.author.urlsafe(),
                'sender_key': user.key.urlsafe(),
                'entity_key': shared_post.key.urlsafe(),
                'entity_type': entity_type,
                'current_institution': user.current_institution.urlsafe(),
                'sender_institution_key': shared_post.institution.urlsafe()
            }

            enqueue_task('post-notification', params)
        elif post.shared_event:
            shared_event = post.shared_event.get()
            if shared_event.author_key != user.key:
                notification_message = post.create_notification_message(
                    user_key=user.key,
                    current_institution_key=user.current_institution,
                    sender_institution_key=shared_event.institution_key
                    )
                send_message_notification(
                    receiver_key=shared_event.author_key.urlsafe(),
                    notification_type='SHARED_EVENT',
                    entity_key=post.key.urlsafe(),
                    message=notification_message
                )
        
        self.response.write(json.dumps(post.make(self.request.host)))
