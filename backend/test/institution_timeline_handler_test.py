# -*- coding: utf-8 -*-
"""Institution Timeline handler test."""

from test_base_handler import TestBaseHandler
from handlers.post_handler import PostHandler
from handlers.post_collection_handler import PostCollectionHandler
from handlers.institution_timeline_handler import InstitutionTimelineHandler
from google.appengine.ext import ndb
import mocks

from mock import patch


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

    @patch('util.login_service.verify_token')
    def test_get(self, verify_token):
        """Test the institution_timeline_handler get method."""
        user = mocks.create_user()
        verify_token._mock_return_value = {'email': user.email[0]}
        institution = mocks.create_institution()
        institution.address = mocks.create_address()
        user.add_institution(institution.key)
        institution.add_member(user)

        post = mocks.create_post(user.key, institution.key)
        post.last_modified_by = user.key
        post_aux = mocks.create_post(user.key, institution.key)
        post_aux.last_modified_by = user.key

        post.put()
        post_aux.put()

        # Call the get method
        posts = self.testapp.get("/api/institutions/%s/timeline?page=0&&limit=2" %
                                 institution.key.urlsafe())
        # Update the objects
        post_top = (posts.json['posts'])[0]
        post_last = (posts.json['posts'])[1]

        # Verify if the posts was published and your informations
        self.assertEqual(
            post_top, 
            post_aux.make(posts.request.host),
            "The maked post should be equal to the expected one"
        )
        self.assertEqual(
            post_last, 
            post.make(posts.request.host),
            "The maked post should be equal to the expected one"
        )

        # Call the delete method for a post that has activity
        post = post.like(user.key)
        post.delete(user)

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
        self.assertEqual(
            post_last, 
            post_aux.make(posts.request.host),
            "The maked post should be equal to the expected one"
        )

    @patch('util.login_service.verify_token')
    def test_get_with_deleted_post(self, verify_token):
        """Test the institution_timeline_handler get method with deleted post."""
        user = mocks.create_user()
        verify_token._mock_return_value = {'email': user.email[0]}
        institution = mocks.create_institution()
        user.add_institution(institution.key)
        institution.add_member(user)
        
        post = mocks.create_post(user.key, institution.key)
        post.last_modified_by = user.key
        other_post = mocks.create_post(user.key, institution.key)
        other_post.last_modified_by = user.key
        other_post.delete(user)
        post.put()
        other_post.put()

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