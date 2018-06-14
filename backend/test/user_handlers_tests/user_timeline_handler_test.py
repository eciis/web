# -*- coding: utf-8 -*-
"""User Timeline handler test."""

from ..test_base_handler import TestBaseHandler
from models import User
from models import Institution
from handlers.post_handler import PostHandler
from handlers.post_collection_handler import PostCollectionHandler
from handlers.user_timeline_handler import UserTimelineHandler
from google.appengine.ext import ndb

from mock import patch


class UserTimelineHandlerTest(TestBaseHandler):
    """User Timeline handler test."""

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(UserTimelineHandlerTest, cls).setUp()
        app = cls.webapp2.WSGIApplication(
            [("/api/user/timeline.*", UserTimelineHandler),
             ("/api/posts/(.*)", PostHandler),
             ("/api/posts", PostCollectionHandler)
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)
        initModels(cls)

    @patch('util.login_service.verify_token', return_value={'email': 'user@gmail.com'})
    def test_get(self, verify_token):
        """Test the user_timeline_handler get method."""
        # Added a post in datastore
        body = {
            'post': self.post_user,
            'currentInstitution': {
                'name': 'currentInstitution'
            }
        }
        self.testapp.post_json(
            "/api/posts", body, headers={'institution-authorization': self.post_user['institution']})
        body['post'] = self.post_aux
        self.testapp.post_json(
            "/api/posts", body, headers={'institution-authorization': self.post_aux['institution']})

        # Call the get method
        posts = self.testapp.get("/api/user/timeline?page=0&&limit=2")

        # Update the objects
        post_top = (posts.json['posts'])[0]
        key_post_top = ndb.Key(urlsafe=post_top['key'])
        post_top_obj = key_post_top.get()
        post_last = (posts.json['posts'])[1]
        key_post_last = ndb.Key(urlsafe=post_last['key'])
        post_last_obj = key_post_last.get()

        # Verify if the posts was published and your informations
        self.assertEqual(post_top_obj.title, 'Post Auxiliar',
                         "The title expected was new post")
        self.assertEqual(post_top_obj.text, "At vero eos et accusamus et iusto",
                         "The text expected was new post")
        self.assertEqual(post_top_obj.state, 'published',
                         "The state of post should be published")
        self.assertEqual(post_last_obj.title, 'Novo edital do institution',
                         "The title expected was new post")
        self.assertEqual(post_last_obj.text, "At vero eos et accusamus et iusto odio",
                         "The text expected was new post")
        self.assertEqual(post_last_obj.state, 'published',
                         "The state of post should be published")

        # Call the delete method for a post that has activity
        post_last_obj.like(self.user.key)
        self.testapp.delete("/api/posts/%s" % post_last_obj.key.urlsafe())

        # Call the get method
        posts = self.testapp.get("/api/user/timeline?page=0&&limit=2")

        # Update the objects
        post_top = (posts.json['posts'])[0]
        post_last = (posts.json['posts'])[1]

        # Verify if the post was deleted and your informations
        self.assertEqual(post_top["title"], None,
                         "The title expected was null")
        self.assertEqual(post_top["text"], None,
                         "The text expected was null")
        self.assertEqual(post_top["state"], 'deleted',
                         "The state of post should be deleted")
        self.assertEqual(post_last["title"], "Post Auxiliar",
                         "The title expected was of post_aux")
        self.assertEqual(post_last["text"], "At vero eos et accusamus et iusto",
                         "The text expected was of post_aux")
        self.assertEqual(post_last["state"], 'published',
                         "The state of post should be published")


def initModels(cls):
    """Init the models."""
    # new User user
    cls.user = User()
    cls.user.name = 'user'
    cls.user.email = ['user@gmail.com']
    cls.user.put()

    # new Institution
    cls.institution = Institution()
    cls.institution.name = 'institution'
    cls.institution.members = [cls.user.key]
    cls.institution.followers = [cls.user.key]
    cls.institution.admin = cls.user.key
    cls.institution.put()

    # POST of user To institution
    cls.post_user = {
        'title': "Novo edital do institution",
        'text': "At vero eos et accusamus et iusto odio",
        'institution': cls.institution.key.urlsafe()
    }
    cls.post_aux = {
        'title': "Post Auxiliar",
        'text': "At vero eos et accusamus et iusto",
        'institution': cls.institution.key.urlsafe()
    }
    cls.user.follows = [cls.institution.key]
    cls.user.put()

    cls.user.add_institution(cls.institution.key)
