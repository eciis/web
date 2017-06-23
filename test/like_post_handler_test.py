# -*- coding: utf-8 -*-
"""Like Post handler test."""
import json
from test_base_handler import TestBaseHandler
from models.post import Post
from models.user import User
from models.institution import Institution
from handlers.like_post_handler import LikePostHandler


class LikePostHandlerTest(TestBaseHandler):
    """Test the handler like_post_handler."""

    LIKE_URI = "/api/posts/%s/likes"

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(LikePostHandlerTest, cls).setUp()
        app = cls.webapp2.WSGIApplication(
            [("/api/posts/(.*)/likes", LikePostHandler),
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)
        initModels(cls)
        # Default authentication with Tiago
        cls.os.environ['REMOTE_USER'] = 'tiago.pereira@ccc.ufcg.edu.br'
        cls.os.environ['USER_EMAIL'] = 'tiago.pereira@ccc.ufcg.edu.br'

    def test_get(self):
        """Test method get of LikePostHandler."""
        # Call the get method
        data = self.testapp.get(self.LIKE_URI % self.mayza_post.key.urlsafe())
        # Verify the status of request
        self.assertEqual(data.status, '200 OK')
        # Get the body of request
        likes = json.loads(data.body)
        # Get the key of authors of likes
        authors = [like['author'].split('/')[-1] for like in likes]
        # Checks if the key of Tiago are not in the authors
        self.assertNotIn(self.tiago.key.urlsafe(), authors)
        # Call the post method
        self.testapp.post(self.LIKE_URI % self.mayza_post.key.urlsafe())
        # Verify if after the like the number of likes at post is 1
        self.mayza_post = self.mayza_post.key.get()
        self.assertEqual(self.mayza_post.get_number_of_likes(), 1,
                         "The number of likes expected was 1, but was %d"
                         % self.mayza_post.get_number_of_likes())
        # Call the get method
        data = self.testapp.get(self.LIKE_URI % self.mayza_post.key.urlsafe())
        # Verify the status of request
        self.assertEqual(data.status, '200 OK')
        # Get the body of request
        likes = json.loads(data.body)
        # Get the key of authors of likes
        authors = [like['author'].split('/')[-1] for like in likes]
        # Checks if the key of Tiago are in the authors
        self.assertIn(self.tiago.name, authors)

    def test_post(self):
        """Test the like_post_handler's post method."""
        # Verify if before the like the number of likes at post is 0
        self.assertEqual(self.mayza_post.get_number_of_likes(), 0,
                         "The number of likes expected was 0, but was %d"
                         % self.mayza_post.get_number_of_likes())
        # Call the post method
        self.testapp.post(self.LIKE_URI % self.mayza_post.key.urlsafe())
        # Verify if after the like the number of likes at post is 1
        self.mayza_post = self.mayza_post.key.get()
        self.assertEqual(self.mayza_post.get_number_of_likes(), 1,
                         "The number of likes expected was 1, but was %d"
                         % self.mayza_post.get_number_of_likes())
        # Call the post method again
        with self.assertRaises(Exception) as exc:
            self.testapp.post(self.LIKE_URI % self.mayza_post.key.urlsafe())
        # Verify if message exception
        exc = get_message_exception(self, exc.exception.message)
        self.assertEquals(exc, "Error! User already liked the publication.")
        # Refresh mayza_post
        self.mayza_post = self.mayza_post.key.get()
        # Verify if after the other like the number of likes at post is 1 yet
        self.assertEqual(self.mayza_post.get_number_of_likes(), 1,
                         "The number of likes expected was 1, but was %d"
                         % self.mayza_post.get_number_of_likes())
        # Authentication with Mayza
        self.os.environ['REMOTE_USER'] = 'mayzabeel@gmail.com'
        self.os.environ['USER_EMAIL'] = 'mayzabeel@gmail.com'
        # Call the post method
        self.testapp.post(self.LIKE_URI % self.mayza_post.key.urlsafe())
        # Refresh mayza_post
        self.mayza_post = self.mayza_post.key.get()
        # Verify if after the like with other user the number of likes at
        # post is 2
        self.assertEqual(self.mayza_post.get_number_of_likes(), 2,
                         "The number of likes expected was 2, but was %d"
                         % self.mayza_post.get_number_of_likes())

    def test_delete(self):
        """Test the like_post_handler's delete method."""
        # Call the post method
        self.testapp.post(self.LIKE_URI % self.mayza_post.key.urlsafe())
        # Refresh mayza_post
        self.mayza_post = self.mayza_post.key.get()
        # Verify if after the like the number of likes at post is 1
        self.assertEqual(self.mayza_post.get_number_of_likes(), 1,
                         "The number of likes expected was 1, but was %d"
                         % self.mayza_post.get_number_of_likes())
        # Call the delete method
        self.testapp.delete(self.LIKE_URI % self.mayza_post.key.urlsafe())
        # Refresh mayza_post
        self.mayza_post = self.mayza_post.key.get()
        # Verify if after the dislike the number of likes at post is 0
        self.assertEqual(self.mayza_post.get_number_of_likes(), 0,
                         "The number of likes expected was 0, but was %d"
                         % self.mayza_post.get_number_of_likes())
        # Call the delete method again
        with self.assertRaises(Exception) as ex:
            self.testapp.delete(self.LIKE_URI % self.mayza_post.key.urlsafe())
        # Verify if message exception
        ex = get_message_exception(self, ex.exception.message)
        self.assertEquals(ex, "Error! User hasn't like in this publication.")
        # Refresh mayza_post
        self.mayza_post = self.mayza_post.key.get()
        # Verify if after the other dislike the number of likes at post is 0
        self.assertEqual(self.mayza_post.get_number_of_likes(), 0,
                         "The number of likes expected was 0, but was %d"
                         % self.mayza_post.get_number_of_likes())

    def tearDown(cls):
        """Deactivate the test."""
        cls.test.deactivate()


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
    # new User Tiago
    cls.tiago = User()
    cls.tiago.name = 'Tiago Pereira'
    cls.tiago.cpf = '089.675.908-65'
    cls.tiago.email = 'tiago.pereira@ccc.ufcg.edu.br'
    cls.tiago.institutions = []
    cls.tiago.follows = []
    cls.tiago.institutions_admin = []
    cls.tiago.notifications = []
    cls.tiago.posts = []
    cls.tiago.put()
    # new Institution SPLAB
    cls.splab = Institution()
    cls.splab.name = 'SPLAB'
    cls.splab.cnpj = '18.104.068/0001-56'
    cls.splab.legal_nature = 'public'
    cls.splab.address = 'Universidade Federal de Campina Grande'
    cls.splab.occupation_area = ''
    cls.splab.description = 'The mission of the Software Practices Laboratory (SPLab) \
            is to promote the development of the state-of-the-art in the \
            theory and practice of Software Engineering.'
    cls.splab.email = 'splab@ufcg.edu.br'
    cls.splab.phone_number = '(83) 3322 7865'
    cls.splab.members = [cls.mayza.key, cls.tiago.key]
    cls.splab.followers = [cls.mayza.key, cls.tiago.key]
    cls.splab.posts = []
    cls.splab.admin = cls.mayza.key
    cls.splab.put()
    # Post of Mayza To SPLAB
    cls.mayza_post = Post()
    cls.mayza_post.title = "Novo edital do SPLAB"
    cls.mayza_post.text = "At vero eos et accusamus et iusto odio dignissimos."
    cls.mayza_post.author = cls.mayza.key
    cls.mayza_post.institution = cls.splab.key
    cls.mayza_post.put()


def get_message_exception(cls, exception):
    """Return only message of string exception."""
    cls.list_args = exception.split("\n")
    cls.dict = eval(cls.list_args[1])
    return cls.dict["msg"]
