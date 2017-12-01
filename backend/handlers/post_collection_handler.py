# -*- coding: utf-8 -*-
"""Post  Collection Handler."""

from google.appengine.ext import ndb
import json
from utils import Utils
from utils import login_required
from utils import json_response

from handlers.base_handler import BaseHandler
from models.post import Post
from models.factory_post import PostFactory
from service_messages import send_message_notification
from service_entities import enqueue_task

from custom_exceptions.notAuthorizedException import NotAuthorizedException


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
    @ndb.transactional(xg=True)
    def post(self, user):
        """Handle POST Requests."""
        data = json.loads(self.request.body)
        institution_key = data['institution']
        institution = ndb.Key(urlsafe=institution_key).get()

        Utils._assert(institution.state == 'inactive',
                      "The institution has been deleted",
                      NotAuthorizedException)

        permission = get_permission(data)
        Utils._assert(user.is_not_authorized([permission], institution_key),
                      "You don't have permission to publish post.",
                      NotAuthorizedException)

        try:
            post = PostFactory.create(data, user.key, institution.key)
            post.put()

            """ Update Institution."""
            institution.posts.append(post.key)
            institution.put()

            """ Update User."""
            user.posts.append(post.key)
            user.put()

            entity_type = PostFactory.get_type(data)
            message = {'type': entity_type, 'from': user.name.encode('utf8')}
            for follower in institution.followers:
                if follower != user.key:
                    send_message_notification(
                        follower.urlsafe(),
                        json.dumps(message),
                        entity_type,
                        post.key.urlsafe())

            if(post.shared_post):
                shared_post = ndb.Key(urlsafe=data['shared_post']).get()

                entity_type = 'SHARED_POST'

                params = {
                    'author_key': post.author.urlsafe(),
                    'user_key': user.key.urlsafe(),
                    'user_name': user.name,
                    'post_key': post.key.urlsafe(),
                    'entity_type': entity_type
                }

                enqueue_task('post-notification', params)

            self.response.write(json.dumps(post.make(self.request.host)))
        except Exception as error:
            self.response.set_status(Utils.BAD_REQUEST)
            self.response.write(Utils.getJSONError(
                Utils.BAD_REQUEST, error.message))
