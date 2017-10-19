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

from custom_exceptions.notAuthorizedException import NotAuthorizedException


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

        permission = PostFactory.get_permission(data)
        Utils._assert(not user.has_permission(permission, institution_key),
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

            if(post.shared_post and user.key != post.shared_post.get().author):
                shared_post = ndb.Key(urlsafe=data['shared_post']).get()

                entity_type = 'SHARED_POST'
                message = {'type': entity_type,
                           'from': user.name.encode('utf8')}
                send_message_notification(shared_post.author.urlsafe(),
                                          json.dumps(message),
                                          entity_type,
                                          post.key.urlsafe())

            self.response.write(json.dumps(Post.make(post, self.request.host)))
        except Exception as error:
            self.response.set_status(Utils.BAD_REQUEST)
            self.response.write(Utils.getJSONError(
                Utils.BAD_REQUEST, error.message))
