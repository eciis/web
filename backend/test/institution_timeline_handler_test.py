# -*- coding: utf-8 -*-
"""Institution Timeline handler test."""

from test_base_handler import TestBaseHandler
from models.user import User
from models.institution import Institution
from handlers.post_handler import PostHandler
from handlers.post_collection_handler import PostCollectionHandler
from handlers.institution_timeline_handler import InstitutionTimelineHandler
from google.appengine.ext import ndb

from mock import patch


class InstitutionTimelineHandlerTest(TestBaseHandler):
    """Institution Timeline Handler Test."""

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(InstitutionTimelineHandlerTest, cls).setUp()
        app = cls.webapp2.WSGIApplication(
            [("/api/institutions/(.*)/timeline", InstitutionTimelineHandler),
             ("/api/posts/(.*)", PostHandler),
             ("/api/posts", PostCollectionHandler)
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)
        initModels(cls)

    @patch('utils.verify_token', return_value={'email': 'mayzabeel@gmail.com'})
    def test_get(self, verify_token):
        """Test the institution_timeline_handler get method."""
        # Pretend an authentication
        self.os.environ['REMOTE_USER'] = 'mayzabeel@gmail.com'
        self.os.environ['USER_EMAIL'] = 'mayzabeel@gmail.com'
        # Added the posts in datastore
        self.testapp.post_json("/api/posts", self.post_mayza)
        self.testapp.post_json("/api/posts", self.post_aux)

        # Call the get method
        posts = self.testapp.get("/api/institutions/%s/timeline" %
                                 self.certbio.key.urlsafe())
        # Update the objects
        post_top = (posts.json)[1]
        key_post_top = ndb.Key(urlsafe=post_top['key'])
        post_top_obj = key_post_top.get()
        post_last = (posts.json)[0]
        key_post_last = ndb.Key(urlsafe=post_last['key'])
        post_last_obj = key_post_last.get()

        # Verify if the posts was published and your informations
        self.assertEqual(post_top_obj.title, 'Post Auxiliar',
                         "The title expected was new post")
        self.assertEqual(post_top_obj.text, "At vero eos et accusamus et iusto",
                         "The text expected was new post")
        self.assertEqual(post_top_obj.state, 'published',
                         "The state of post should be published")
        self.assertEqual(post_last_obj.title, 'Novo edital do CERTBIO',
                         "The title expected was new post")
        self.assertEqual(post_last_obj.text, "At vero eos et accusamus et iusto",
                         "The text expected was new post")
        self.assertEqual(post_last_obj.state, 'published',
                         "The state of post should be published")

        # Call the delete method for a post that has activity
        post_last_obj.like(self.mayza.key)
        self.testapp.delete("/api/posts/%s" % post_last_obj.key.urlsafe())

        # Call the get method
        posts = self.testapp.get("/api/institutions/%s/timeline" %
                                 self.certbio.key.urlsafe())

        # Update the objects
        post_top = (posts.json)[1]
        post_last = (posts.json)[0]

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
    # new User Mayza
    cls.mayza = User()
    cls.mayza.name = 'Mayza Nunes'
    cls.mayza.cpf = '089.675.908-90'
    cls.mayza.email = ['mayzabeel@gmail.com']
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
    cls.certbio.occupation_area = ''
    cls.certbio.description = 'Ensaio Químico'
    cls.certbio.email = 'certbio@ufcg.edu.br'
    cls.certbio.phone_number = '(83) 3322 4455'
    cls.certbio.members = [cls.mayza.key]
    cls.certbio.followers = [cls.mayza.key]
    cls.certbio.posts = []
    cls.certbio.admin = cls.mayza.key
    cls.certbio.put()
    # POST of Mayza To Certbio Institution
    cls.post_mayza = {
        'title': "Novo edital do CERTBIO",
        'text': "At vero eos et accusamus et iusto",
        'institution': cls.certbio.key.urlsafe()
    }
    cls.post_aux = {
        'title': "Post Auxiliar",
        'text': "At vero eos et accusamus et iusto",
        'institution': cls.certbio.key.urlsafe()
    }
    cls.mayza.follows = [cls.certbio.key]
    cls.mayza.put()

    cls.mayza.add_institution(cls.certbio.key)
