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
            [("/api/institutions/(.*)/timeline.*", InstitutionTimelineHandler),
             ("/api/posts/(.*)", PostHandler),
             ("/api/posts", PostCollectionHandler)
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)
        initModels(cls)

    @patch('utils.verify_token', return_value={'email': 'user1@email.com'})
    def test_get(self, verify_token):
        """Test the institution_timeline_handler get method."""
        # Pretend an authentication
        self.os.environ['REMOTE_USER'] = 'user1@email.com'
        self.os.environ['USER_EMAIL'] = 'user1@email.com'
        # Added the posts in datastore
        self.testapp.post_json("/api/posts", self.post_user1)
        self.testapp.post_json("/api/posts", self.post_aux)

        # Call the get method
        posts = self.testapp.get("/api/institutions/%s/timeline?page=0&&limit=2" %
                                 self.inst1.key.urlsafe())
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
        self.assertEqual(post_last_obj.title, 'Novo edital do Inst 1',
                         "The title expected was new post")
        self.assertEqual(post_last_obj.text, "At vero eos et accusamus et iusto",
                         "The text expected was new post")
        self.assertEqual(post_last_obj.state, 'published',
                         "The state of post should be published")

        # Call the delete method for a post that has activity
        post_last_obj.like(self.user1.key)
        self.testapp.delete("/api/posts/%s" % post_last_obj.key.urlsafe())

        # Call the get method
        posts = self.testapp.get("/api/institutions/%s/timeline?page=0&&limit=2" %
                                 self.inst1.key.urlsafe())

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
    # new User1
    cls.user1 = User()
    cls.user1.name = 'User 1'
    cls.user1.cpf = '089.675.908-90'
    cls.user1.email = ['user1@email.com']
    cls.user1.institutions = []
    cls.user1.follows = []
    cls.user1.institutions_admin = []
    cls.user1.notifications = []
    cls.user1.posts = []
    cls.user1.put()
    # new Inst1
    cls.inst1 = Institution()
    cls.inst1.name = 'Inst 1'
    cls.inst1.acronym = 'Inst 1'
    cls.inst1.cnpj = '18.104.068/0001-86'
    cls.inst1.legal_nature = 'public'
    cls.inst1.actuation_area = ''
    cls.inst1.description = 'Ensaio Químico'
    cls.inst1.email = 'inst1@email.com'
    cls.inst1.phone_number = '(83) 3322 4455'
    cls.inst1.members = [cls.user1.key]
    cls.inst1.followers = [cls.user1.key]
    cls.inst1.posts = []
    cls.inst1.admin = cls.user1.key
    cls.inst1.put()
    # POST of Mayza To Certbio Institution
    cls.post_user1 = {
        'title': "Novo edital do Inst 1",
        'text': "At vero eos et accusamus et iusto",
        'institution': cls.inst1.key.urlsafe()
    }
    cls.post_aux = {
        'title': "Post Auxiliar",
        'text': "At vero eos et accusamus et iusto",
        'institution': cls.inst1.key.urlsafe()
    }
    cls.user1.follows = [cls.inst1.key]
    cls.user1.put()

    cls.user1.add_institution(cls.inst1.key)
