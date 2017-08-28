# -*- coding: utf-8 -*-
"""Post Collection handler test."""

from test_base_handler import TestBaseHandler
from models.user import User
from models.institution import Institution
from models.post import Post
from handlers.post_collection_handler import PostCollectionHandler
from google.appengine.ext import ndb
import json

from mock import patch


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
                                                     self.certbio.key.urlsafe(),
                                                     'text':
                                                     'testing new post'})
        # Retrieve the entities
        post = json.loads(post._app_iter[0])
        key_post = ndb.Key(urlsafe=post['key'])
        post_obj = key_post.get()
        self.certbio = self.certbio.key.get()
        self.mayza = self.mayza.key.get()
        # Check if the post's key is in institution and user
        self.assertTrue(key_post in self.mayza.posts,
                        "The post is not in user.posts")
        self.assertTrue(key_post in self.certbio.posts,
                        "The post is not in institution.posts")
        # Check if the post's attributes are the expected
        self.assertEqual(post_obj.title, 'new post',
                         "The title expected was new post")
        self.assertEqual(post_obj.institution, self.certbio.key,
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
                                                  self.certbio.key.urlsafe(),
                                                  'text':
                                                  'testing another post'})

        with self.assertRaises(Exception):
            self.testapp.post_json("/api/posts", {'institution':
                                                  self.certbio.key.urlsafe(),
                                                  'title':
                                                  'testing another post'})

    @patch('utils.verify_token', return_value={'email': 'mayzabeel@gmail.com'})
    def test_post_sharing(self, verify_token):
        """Test the post_collection_handler's post method."""
        # Make the request and assign the answer to post
        post = self.testapp.post_json("/api/posts", {'institution':
                                                     self.certbio.key.urlsafe(),
                                                     'shared_post':
                                                     self.mayza_post.key.urlsafe()}).json
        # Retrieve the entities
        key_post = ndb.Key(urlsafe=post['key'])
        post_obj = key_post.get()
        self.certbio = self.certbio.key.get()
        self.mayza = self.mayza.key.get()
        # Check if the post's key is in institution and user
        self.assertTrue(key_post in self.mayza.posts,
                        "The post is not in user.posts")
        self.assertTrue(key_post in self.certbio.posts,
                        "The post is not in institution.posts")
        # Check if the post's attributes are the expected
        self.assertEqual(post_obj.institution, self.certbio.key,
                         "The post's institution is not the expected one")

        shared_post_obj = post['shared_post']

        # Check if the shared_post's attributes are the expected
        self.assertEqual(shared_post_obj['title'], "Post existente",
                         "The post's title expected is Post existente")
        # self.assertEqual(shared_post_obj.institution, self.certbio.key,
        #                  "The post's institution expected is certbio")
        self.assertEqual(shared_post_obj['text'],
                         "Post inicial que quero compartilhar",
                         "The post's text expected is Post inicial que quero compartilhar")


def initModels(cls):
    """Init the models."""
    # new User Mayza
    cls.mayza = User()
    cls.mayza.name = 'Mayza Nunes'
    cls.mayza.cpf = '089.675.908-90'
    cls.mayza.email = 'mayzabeel@gmail.com'
    cls.mayza.institutions = []
    cls.mayza.follows = []
    cls.mayza.institutions_admin = []
    cls.mayza.notifications = []
    cls.mayza.posts = []
    cls.mayza.put()
    # new Institution CERTBIO
    cls.certbio = Institution()
    cls.certbio.name = 'CERTBIO'
    cls.certbio.acronym = 'CERTBIO'
    cls.certbio.cnpj = '18.104.068/0001-86'
    cls.certbio.legal_nature = 'public'
    cls.certbio.address = 'Universidade Federal de Campina Grande'
    cls.certbio.occupation_area = ''
    cls.certbio.description = 'Ensaio Químico - Determinação de Material Volátil por \
            Gravimetria e Ensaio Biológico - Ensaio de Citotoxicidade'
    cls.certbio.email = 'certbio@ufcg.edu.br'
    cls.certbio.phone_number = '(83) 3322 4455'
    cls.certbio.members = [cls.mayza.key]
    cls.certbio.followers = [cls.mayza.key]
    cls.certbio.posts = []
    cls.certbio.admin = cls.mayza.key
    cls.certbio.put()
    # POST of Mayza To Certbio Institution
    cls.mayza_post = Post()
    cls.mayza_post.title = "Post existente"
    cls.mayza_post.text = "Post inicial que quero compartilhar"
    cls.mayza_post.author = cls.mayza.key
    cls.mayza_post.last_modified_by = cls.mayza.key
    cls.mayza_post.institution = cls.certbio.key
    cls.mayza_post.put()

    """ Update Institution."""
    cls.certbio.posts.append(cls.mayza_post.key)
    cls.certbio.put()

    """ Update User."""
    cls.mayza.posts.append(cls.mayza_post.key)
    cls.mayza.add_institution(cls.certbio.key)
    cls.mayza_post.put()
