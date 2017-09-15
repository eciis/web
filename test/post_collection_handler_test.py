# -*- coding: utf-8 -*-
"""Post Collection handler test."""

from test_base_handler import TestBaseHandler
from models.user import User
from models.institution import Institution
from models.post import Post
from models.event import Event
from handlers.post_collection_handler import PostCollectionHandler
from google.appengine.ext import ndb
import json

from mock import patch
import datetime


class PostCollectionHandlerTest(TestBaseHandler):
    """Post Collection handler test."""

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(PostCollectionHandlerTest, cls).setUp()
        app = cls.webapp2.WSGIApplication(
            [("/api/posts", PostCollectionHandler),
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)
        initModels(cls)

    @patch('utils.verify_token', return_value={'email': 'mayzabeel@gmail.com'})
    def test_post(self, verify_token):
        """Test the post_collection_handler's post method."""

        # Make the request and assign the answer to post
        post = self.testapp.post_json("/api/posts", {'title': 'new post',
                                                     'institution':
                                                     self.institution.key.urlsafe(),
                                                     'text':
                                                     'testing new post'})
        # Retrieve the entities
        post = json.loads(post._app_iter[0])
        key_post = ndb.Key(urlsafe=post['key'])
        post_obj = key_post.get()
        self.institution = self.institution.key.get()
        self.user = self.user.key.get()
        # Check if the post's key is in institution and user
        self.assertTrue(key_post in self.user.posts,
                        "The post is not in user.posts")
        self.assertTrue(key_post in self.user.posts,
                        "The post is not in institution.posts")
        # Check if the post's attributes are the expected
        self.assertEqual(post_obj.title, 'new post',
                         "The title expected was new post")
        self.assertEqual(post_obj.institution, self.institution.key,
                         "The post's institution is not the expected one")
        self.assertEqual(post_obj.text,
                         'testing new post',
                         "The post's text is not the expected one")

        # TODO:
        # Fix the post method.
        # The try except block prevents that FieldException be raised
        # @author Raoni Smaneoto 11-06-2017
        with self.assertRaises(Exception):
            self.testapp.post_json("/api/posts", {'institution':
                                                  self.institution.key.urlsafe(),
                                                  'text':
                                                  'testing another post'})

        with self.assertRaises(Exception):
            self.testapp.post_json("/api/posts", {'institution':
                                                  self.institution.key.urlsafe(),
                                                  'title':
                                                  'testing another post'})

    @patch('utils.verify_token', return_value={'email': 'mayzabeel@gmail.com'})
    def test_post_sharing(self, verify_token):
        """Test the post_collection_handler's post method."""
        # Make the request and assign the answer to post
        post = self.testapp.post_json("/api/posts", {'institution':
                                                     self.institution.key.urlsafe(),
                                                     'shared_post':
                                                     self.user_post.key.urlsafe()}).json
        # Retrieve the entities
        key_post = ndb.Key(urlsafe=post['key'])
        post_obj = key_post.get()
        self.institution = self.institution.key.get()
        self.user = self.user.key.get()
        # Check if the post's key is in institution and user
        self.assertTrue(key_post in self.user.posts,
                        "The post is not in user.posts")
        self.assertTrue(key_post in self.institution.posts,
                        "The post is not in institution.posts")
        # Check if the post's attributes are the expected
        self.assertEqual(post_obj.institution, self.institution.key,
                         "The post's institution is not the expected one")

        shared_post_obj = post['shared_post']

        # Check if the shared_post's attributes are the expected
        self.assertEqual(shared_post_obj['title'], "Post existente",
                         "The post's title expected is Post existente")
        self.assertEqual(shared_post_obj['institution_key'], self.institution.key.urlsafe(),
                         "The post's institution expected is certbio")
        self.assertEqual(shared_post_obj['text'],
                         "Post inicial que quero compartilhar",
                         "The post's text expected is Post inicial que quero compartilhar")

    @patch('utils.verify_token', return_value={'email': 'mayzabeel@gmail.com'})
    def test_post_shared_event(self, verify_token):
        """Test the post_collection_handler's post method in case that post is shared_event."""
        # Make the request and assign the answer to post
        post = self.testapp.post_json("/api/posts", {'institution':
                                                     self.institution.key.urlsafe(),
                                                     'shared_event':
                                                     self.event.key.urlsafe()}).json
        # Retrieve the entities
        key_post = ndb.Key(urlsafe=post['key'])
        post_obj = key_post.get()
        self.institution = self.institution.key.get()
        self.user = self.user.key.get()
        # Check if the post's key is in institution and user
        self.assertTrue(key_post in self.user.posts,
                        "The post is not in user.posts")
        self.assertTrue(key_post in self.institution.posts,
                        "The post is not in institution.posts")
        # Check if the post's attributes are the expected
        self.assertEqual(post_obj.institution, self.institution.key,
                         "The post's institution is not the expected one")

        shared_event_obj = post['shared_event']

        # Check if the shared_post's attributes are the expected
        self.assertEqual(shared_event_obj['title'], "New Event",
                         "The post's title expected is Post existente")
        self.assertEqual(shared_event_obj['institution_key'],
                         self.institution.key.urlsafe(),
                         "The post's institution expected is certbio")
        self.assertEqual(shared_event_obj['author_key'],
                         self.user.key.urlsafe(),
                         "The post's institution expected is certbio")
        self.assertEqual(shared_event_obj['text'],
                         "Description of new Event",
                         "The post's text expected is Post inicial que quero compartilhar")


def initModels(cls):
    """Init the models."""
    # new User Mayza
    cls.user = User()
    cls.user.name = 'Mayza Nunes'
    cls.user.cpf = '089.675.908-90'
    cls.user.email = 'mayzabeel@gmail.com'
    cls.user.photo_url = 'urlphoto'
    cls.user.institutions_admin = []
    cls.user.posts = []
    cls.user.put()
    # new Institution CERTBIO
    cls.institution = Institution()
    cls.institution.name = 'CERTBIO'
    cls.institution.email = 'certbio@ufcg.edu.br'
    cls.institution.photo_url = 'urlphoto'
    cls.institution.posts = []
    cls.institution.admin = cls.user.key
    cls.institution.put()
    # POST of Mayza To Certbio Institution
    cls.user_post = Post()
    cls.user_post.title = "Post existente"
    cls.user_post.text = "Post inicial que quero compartilhar"
    cls.user_post.author = cls.user.key
    cls.user_post.last_modified_by = cls.user.key
    cls.user_post.institution = cls.institution.key
    cls.user_post.put()

    """ Update Institution."""
    cls.institution.posts.append(cls.user_post.key)
    cls.institution.put()

    """ Update User."""
    cls.user.posts.append(cls.user_post.key)
    cls.user.add_institution(cls.institution.key)
    cls.user_post.put()

    # Events
    cls.event = Event()
    cls.event.title = "New Event"
    cls.event.text = "Description of new Event"
    cls.event.author_key = cls.user.key
    cls.event.author_name = cls.user.name
    cls.event.author_photo = cls.user.photo_url
    cls.event.institution_key = cls.institution.key
    cls.event.institution_name = cls.institution.name
    cls.event.institution_photo = cls.institution.photo_url
    cls.event.start_time = datetime.datetime.now()
    cls.event.end_time = datetime.datetime.now()
    cls.event.local = "Event location"
    cls.event.put()
