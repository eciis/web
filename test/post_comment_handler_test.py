# -*- coding: utf-8 -*-
"""Post Comment handler test."""

from test_base_handler import TestBaseHandler
from custom_exceptions.notAuthorizedException import NotAuthorizedException
from handlers.post_comment_handler import PostCommentHandler
from handlers.post_comment_handler import check_permission
from models.user import User
from models.institution import Institution
from models.post import Post
import json

from mock import patch

MAIANA_EMAIL = 'maiana.brito@ccc.ufcg.edu.br'
MAYZA_EMAIL = 'mayzabeel@gmail.com'


class PostCommentHandlerTest(TestBaseHandler):
    """Post Comment handler test."""

    URL_POST_COMMENT = "/api/posts/%s/comments"
    URL_DELETE_COMMENT = "/api/posts/%s/comments/%s"


    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(PostCommentHandlerTest, cls).setUp()
        app = cls.webapp2.WSGIApplication(
            [("/api/posts/(.*)/comments/(.*)", PostCommentHandler),
             ("/api/posts/(.*)/comments", PostCommentHandler),
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)
        initModels(cls)

    @patch('utils.verify_token', return_value={'email': MAIANA_EMAIL})
    def test_post(self, verify_token):
        """Another user comment in Post of Mayza."""
        # Pretend an authentication
        self.os.environ['REMOTE_USER'] = self.maiana.email
        self.os.environ['USER_EMAIL'] = self.maiana.email

        # Verify size of list
        self.assertEquals(len(self.mayza_post.comments), 0,
                          "Expected size of comment's list should be zero")

        # Call the post method
        self.testapp.post(self.URL_POST_COMMENT % self.mayza_post.key.urlsafe(),
                          json.dumps(self.comment))

        # Update post
        self.mayza_post = self.mayza_post.key.get()

        # Verify size of list
        self.assertEquals(len(self.mayza_post.comments), 1,
                          "Expected size of comment's list should be one")

    @patch('utils.verify_token', return_value={'email': MAYZA_EMAIL})
    def test_post_ownerpost(self, verify_token):
        """Owner user comment in Post."""
        # Pretend an authentication
        self.os.environ['REMOTE_USER'] = self.mayza.email
        self.os.environ['USER_EMAIL'] = self.mayza.email

        # Verify size of list
        self.assertEquals(len(self.mayza_post.comments), 0,
                          "Expected size of comment's list should be zero")

        # Call the post method
        self.testapp.post(self.URL_POST_COMMENT % self.mayza_post.key.urlsafe(),
                          json.dumps(self.other_comment))

        # Update post
        self.mayza_post = self.mayza_post.key.get()

        # Verify size of list
        self.assertEquals(len(self.mayza_post.comments), 1,
                          "Expected size of comment's list should be one")

    @patch('utils.verify_token', return_value={'email': MAIANA_EMAIL})
    def test_delete(self, verify_token):
        """User can delete your comment in Post."""
        # Pretend an authentication
        self.os.environ['REMOTE_USER'] = self.maiana.email
        self.os.environ['USER_EMAIL'] = self.maiana.email

        # Added comment
        self.response = self.testapp.post(self.URL_POST_COMMENT %
                                          self.mayza_post.key.urlsafe(),
                                          json.dumps(self.comment)).json
        # ID of comment
        self.id_comment = self.response["id"]
        self.mayza_post = self.mayza_post.key.get()
        self.assertEquals(len(self.mayza_post.comments), 1,
                          "Expected size of comment's list should be one")

        # Call the delete method
        self.testapp.delete(self.URL_DELETE_COMMENT %
                            (self.mayza_post.key.urlsafe(), self.id_comment))

        # Update post
        self.mayza_post = self.mayza_post.key.get()

        # Verify size of list
        self.assertEquals(len(self.mayza_post.comments), 0,
                          "Expected size of comment's list should be zero")

    @patch('utils.verify_token', return_value={'email': MAYZA_EMAIL})
    def test_delete_simpleuser(self, verify_token):
        """An simple user can't delete comments by other users in Post."""
        # Pretend an authentication
        self.os.environ['REMOTE_USER'] = self.mayza.email
        self.os.environ['USER_EMAIL'] = self.mayza.email

        # Added comment of Mayza
        self.response = self.testapp.post(self.URL_POST_COMMENT %
                                          self.mayza_post.key.urlsafe(),
                                          json.dumps(self.comment)).json
        # ID of comment
        self.id_comment = self.response["id"]
        self.mayza_post = self.mayza_post.key.get()
        self.assertEquals(len(self.mayza_post.comments), 1,
                          "Expected size of comment's list should be one")

        # Pretend an authentication
        verify_token.return_value={'email': MAIANA_EMAIL}

        self.os.environ['REMOTE_USER'] = self.maiana.email
        self.os.environ['USER_EMAIL'] = self.maiana.email

        # User Maiana call the delete method
        with self.assertRaises(Exception) as ex:
            self.testapp.delete(self.URL_DELETE_COMMENT %
                                (self.mayza_post.key.urlsafe(), self.id_comment))

        ex = get_message_exception(self, ex.exception.message)
        self.assertEquals(ex, "Error! User not allowed to remove comment")
        self.assertEquals(len(self.mayza_post.comments), 1,
                          "Expected size of comment's list should be one")

    @patch('utils.verify_token', return_value={'email': MAIANA_EMAIL})
    def test_delete_ownerpost(self, verify_token):
        """Owner user can delete comment from other user in Post."""
        # Pretend an authentication
        self.os.environ['REMOTE_USER'] = self.maiana.email
        self.os.environ['USER_EMAIL'] = self.maiana.email

        # Added comment user Maiana
        self.response = self.testapp.post(self.URL_POST_COMMENT %
                                          self.mayza_post.key.urlsafe(),
                                          json.dumps(self.other_comment)).json
        # ID of comment
        self.id_other_comment = self.response["id"]
        self.mayza_post = self.mayza_post.key.get()
        self.assertEquals(len(self.mayza_post.comments), 1,
                          "Expected size of comment's list should be one")

        # Pretend an authentication
        self.os.environ['REMOTE_USER'] = self.mayza.email
        self.os.environ['USER_EMAIL'] = self.mayza.email

        # Call the delete method
        self.testapp.delete(self.URL_DELETE_COMMENT %
                            (self.mayza_post.key.urlsafe(), self.id_other_comment))

        # Update post
        self.mayza_post = self.mayza_post.key.get()

        # Verify size of list
        self.assertEquals(len(self.mayza_post.comments), 0,
                          "Expected size of comment's list should be zero")

    @patch('utils.verify_token', return_value={'email': MAYZA_EMAIL})
    def test_check_permission(self, verify_token):
        """Test method check_permission in post_comment_handler."""
        # Pretend an authentication
        self.os.environ['REMOTE_USER'] = self.mayza.email
        self.os.environ['USER_EMAIL'] = self.mayza.email

        # Added comment
        self.response = self.testapp.post(self.URL_POST_COMMENT %
                                          self.mayza_post.key.urlsafe(),
                                          json.dumps(self.comment)).json
        # ID of comment
        self.id_comment = self.response["id"]

        # Update post
        self.mayza_post = self.mayza_post.key.get()

        # When a user(Maiana) try delete comment of other user(Mayza).
        with self.assertRaises(NotAuthorizedException):
            check_permission(self.maiana, self.mayza_post, self.id_comment)


def initModels(cls):
    """Init the models."""
    # new User Mayza
    cls.mayza = User()
    cls.mayza.name = 'Mayza Nunes'
    cls.mayza.cpf = '089.675.908-90'
    cls.mayza.email = MAYZA_EMAIL
    cls.mayza.institutions = []
    cls.mayza.follows = []
    cls.mayza.institutions_admin = []
    cls.mayza.notifications = []
    cls.mayza.posts = []
    cls.mayza.put()
    # new User Maiana
    cls.maiana = User()
    cls.maiana.name = 'Maiana Brito'
    cls.maiana.cpf = '089.675.908-91'
    cls.maiana.email = MAIANA_EMAIL
    cls.maiana.institutions = []
    cls.maiana.follows = []
    cls.maiana.institutions_admin = []
    cls.maiana.notifications = []
    cls.maiana.posts = []
    cls.maiana.put()
    # new Institution CERTBIO
    cls.certbio = Institution()
    cls.certbio.name = 'CERTBIO'
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
    cls.mayza_post.title = "Novo edital do CERTBIO"
    cls.mayza_post.text = "At vero eos et accusamus et iusto odio"
    cls.mayza_post.author = cls.mayza.key
    cls.mayza_post.institution = cls.certbio.key
    cls.mayza_post.put()

    # Comments
    cls.comment = {'text': 'Frist comment. Using in Test', 'institution_key': cls.certbio.key.urlsafe()}
    cls.other_comment = {'text': 'Second comment. Using in Test', 'institution_key': cls.certbio.key.urlsafe()}


def get_message_exception(cls, exception):
    """Return only message of string exception."""
    cls.list_args = exception.split("\n")
    cls.dict = eval(cls.list_args[1])
    return cls.dict["msg"]
