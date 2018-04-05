# -*- coding: utf-8 -*-
"""Institution Timeline handler test."""

from test_base_handler import TestBaseHandler
from handlers.post_handler import PostHandler
from handlers.post_collection_handler import PostCollectionHandler
from handlers.institution_timeline_handler import InstitutionTimelineHandler
from google.appengine.ext import ndb
import mocks

from mock import patch

USER = {'email': 'user@email.com'}


class InstitutionTimelineHandlerTest(TestBaseHandler):
    """Institution Timeline Handler Test."""

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(InstitutionTimelineHandlerTest, cls).setUp()
        app = cls.webapp2.WSGIApplication(
            [("/api/institutions/(.*)/timeline.*", InstitutionTimelineHandler),
             ("/api/posts/(.*)", PostHandler),
             ("/api/posts", PostCollectionHandler)
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)

    @patch('utils.verify_token', return_value=USER)
    def test_get(self, verify_token):
        """Test the institution_timeline_handler get method."""
        user = mocks.create_user(USER['email'])
        institution = mocks.create_institution()
        institution.address = mocks.create_address()
        user.add_institution(institution.key)
        institution.add_member(user)
        post = {'post': {
                'title': "Novo edital da instituição",
                'text': "At vero eos et accusamus et iusto",
                'institution': institution.key.urlsafe()
            }
        }
        post_aux = {'post': {
                'title': "Post Auxiliar",
                'text': "At vero eos et accusamus et iusto",
                'institution': institution.key.urlsafe()
            }
        }
        self.testapp.post_json("/api/posts", post, headers={'institution-authorization': institution.key.urlsafe()})
        self.testapp.post_json("/api/posts", post_aux, headers={'institution-authorization': institution.key.urlsafe()})

        # Call the get method
        posts = self.testapp.get("/api/institutions/%s/timeline?page=0&&limit=2" %
                                 institution.key.urlsafe())
        # Update the objects
        post_top = (posts.json['posts'])[0]
        key_post_top = ndb.Key(urlsafe=post_top['key'])
        post_top_obj = key_post_top.get()
        post_last = (posts.json['posts'])[1]
        key_post_last = ndb.Key(urlsafe=post_last['key'])
        post_last_obj = key_post_last.get()

        # Verify if the posts was published and your informations
        self.assertEqual(post_top_obj.title, 'Post Auxiliar',
                         "The title is not the expected one")
        self.assertEqual(post_top_obj.text, "At vero eos et accusamus et iusto",
                         "The text is not the expected one")
        self.assertEqual(post_top_obj.state, 'published',
                         "The state of post should be published")
        self.assertEqual(post_last_obj.title, 'Novo edital da instituição',
                         "The title is not the expected one")
        self.assertEqual(post_last_obj.text, "At vero eos et accusamus et iusto",
                         "The text is not the expected one")
        self.assertEqual(post_last_obj.state, 'published',
                         "The state of post should be published")

        # Call the delete method for a post that has activity
        post_last_obj.like(user.key)
        self.testapp.delete("/api/posts/%s" % post_last_obj.key.urlsafe())

        # Call the get method
        posts = self.testapp.get("/api/institutions/%s/timeline?page=0&&limit=2" %
                                 institution.key.urlsafe())

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
                         "The title is not the expected one")
        self.assertEqual(post_last["text"], "At vero eos et accusamus et iusto",
                         "The text is not the expected one")
        self.assertEqual(post_last["state"], 'published',
                         "The state of post should be published")
    
    @patch('utils.verify_token', return_value=USER)
    def test_get_with_deleted_post(self, verify_token):
        """Test the institution_timeline_handler get method whit deleted post."""
        user = mocks.create_user()
        institution = mocks.create_institution()
        user.add_institution(institution.key)
        institution.add_member(user)
        
        post = mocks.create_post(user.key, institution.key)
        post.last_modified_by = user.key
        ohter_post = mocks.create_post(user.key, institution.key)
        ohter_post.last_modified_by = user.key
        ohter_post.state = 'deleted'
        post.put()
        ohter_post.put()

        posts = self.testapp.get("/api/institutions/%s/timeline?page=0&&limit=2" %
                                 institution.key.urlsafe())
        
        post_json = (posts.json['posts'])[0]

        self.assertEqual(
            len(posts.json['posts']), 
            1,
            "Number of posts should be equal 1"
        )
        self.assertEqual(
            post_json, 
            post.make(posts.request.host),
            "The maked post should be equal to the expected one"    
        )