# -*- coding: utf-8 -*-
"""Post handler test."""


from test_base import TestBase
from models.post import Post
from models.user import User
from models.institution import Institution
from handlers.post_handler import PostHandler


class PostHandlerTest(TestBase):
    """Test the post_handler class."""

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        cls.test = cls.testbed.Testbed()
        cls.test.activate()
        cls.policy = cls.datastore.PseudoRandomHRConsistencyPolicy(
            probability=1)
        cls.test.init_datastore_v3_stub(consistency_policy=cls.policy)
        cls.test.init_memcache_stub()
        cls.ndb.get_context().set_cache_policy(False)
        app = cls.webapp2.WSGIApplication(
            [("/api/post/(.*)", PostHandler),
             ("/api/post/(.*)/like", PostHandler),
             ("/api/post/(.*)/deslike", PostHandler),
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)
        initModels(cls)

    def test_delete(self):
        """Test the post_handler's delete method."""
        # Pretend an authentication
        self.os.environ['REMOTE_USER'] = 'mayzabeel@gmail.com'
        self.os.environ['USER_EMAIL'] = 'mayzabeel@gmail.com'
        # Verify if before the delete the post's state is published
        self.assertEqual(self.mayza_post.state, 'published',
                         "The post's state must be published")
        # Call the delete method
        self.testapp.delete("/api/post/%s" % self.mayza_post.key.urlsafe())
        # Retrieve the post from the datastore, once it has been changed
        self.mayza_post = self.mayza_post.key.get()
        # Make sure the post's state is deleted
        self.assertEqual(self.mayza_post.state, 'deleted',
                         "The post's state must be deleted")

        # Pretend an authentication
        self.os.environ['REMOTE_USER'] = 'raoni.smaneoto@ccc.ufcg.edu.br'
        self.os.environ['USER_EMAIL'] = 'raoni.smaneoto@ccc.ufcg.edu.br'
        # Verify if before the delete the post's state is published
        self.assertEqual(self.raoni_post2.state, 'published',
                         "The post's state must be published")
        # Call the delete method
        self.testapp.delete("/api/post/%s" % self.raoni_post2.key.urlsafe())
        # Retrieve the post from the datastore, once it has been changed
        self.raoni_post2 = self.raoni_post2.key.get()
        # Make sure the post's state is deleted
        self.assertEqual(self.raoni_post2.state, 'deleted',
                         "The post's state must be deleted")

    def test_post(self):
        """Test the post_handler's post method."""
        # Pretend an authentication
        self.os.environ['REMOTE_USER'] = 'mayzabeel@gmail.com'
        self.os.environ['USER_EMAIL'] = 'mayzabeel@gmail.com'
        # Verify if before the like the number of likes at post is 0
        self.assertEqual(self.mayza_post.likes, 0,
                         "The number of likes expected was 0")
        # Call the delete method
        self.testapp.post_json("/api/post/%s/like"
                               % self.mayza_post.key.urlsafe())
        # Verify if after the like the number of likes at post is 1
        self.mayza_post = self.mayza_post.key.get()
        self.assertEqual(self.mayza_post.likes, 1,
                         "The number of likes expected was 1")

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
    # new User Raoni
    cls.raoni = User()
    cls.raoni.name = 'Raoni Smaneoto'
    cls.raoni.cpf = '089.675.908-65'
    cls.raoni.email = 'raoni.smaneoto@ccc.ufcg.edu.br'
    cls.raoni.institutions = []
    cls.raoni.follows = []
    cls.raoni.institutions_admin = []
    cls.raoni.notifications = []
    cls.raoni.posts = []
    cls.raoni.put()
    # new User Ruan
    cls.ruan = User()
    cls.ruan.name = 'Ruan'
    cls.ruan.cpf = '089.675.908-65'
    cls.ruan.email = 'ruan@gmail.com'
    cls.ruan.institutions = []
    cls.ruan.follows = []
    cls.ruan.institutions_admin = []
    cls.ruan.notifications = []
    cls.ruan.posts = []
    cls.ruan.put()
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
    cls.certbio.members = [cls.mayza.key, cls.raoni.key]
    cls.certbio.followers = [cls.mayza.key, cls.raoni.key]
    cls.certbio.posts = []
    cls.certbio.admin = cls.mayza.key
    cls.certbio.put()
    # POST of Mayza To Certbio Institution
    cls.mayza_post = Post()
    cls.mayza_post.title = "Novo edital do CERTBIO"
    cls.mayza_post.text = "At vero eos et accusamus et iusto odio dignissimos \
        ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti \
        quos dolores et quas molestias excepturi sint occaecati cupiditate \
        aut perferendis doloribus asperiores repellat."
    cls.mayza_post.author = cls.mayza.key
    cls.mayza_post.institution = cls.certbio.key
    cls.mayza_post.put()
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
    cls.splab.image_url = 'http://amaurymedeiros.com/images/splab.png'
    cls.splab.email = 'splab@ufcg.edu.br'
    cls.splab.phone_number = '(83) 3322 7865'
    cls.splab.members = [cls.mayza.key, cls.ruan.key]
    cls.splab.followers = [cls.mayza.key, cls.ruan.key]
    cls.splab.posts = []
    cls.splab.admin = cls.mayza.key
    cls.splab.put()
    # POST of Raoni
    cls.raoni_post = Post()
    cls.raoni_post.title = "Novwdfssdo edital do CERTBIO"
    cls.raoni_post.text = "At vero eos et accusamus et iusto odio dignissimos \
        ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti \
        delectus, ut aut reiciendis voluptatibus maiores alias consequatur \
        aut perferendis doloribus asperiores repellat."
    cls.raoni_post.author = cls.raoni.key
    cls.raoni_post.institution = cls.splab.key
    cls.raoni_post.put()
    # Another post of Raoni
    cls.raoni_post2 = Post()
    cls.raoni_post2.title = "Novwdfsadsssdo edital do CERTBIO"
    cls.raoni_post2.text = "At vero eos et accusamus et iusto odio dignissimos \
        ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti \
        delectus, ut aut reiciendis voluptatibus maiores alias consequatur \
        aut perferendis doloribus asperiores repellat."
    cls.raoni_post2.author = cls.raoni.key
    cls.raoni_post2.institution = cls.certbio.key
    cls.raoni_post2.put()
    # POST of Ruan To Certbio Institution
    cls.ruan_post = Post()
    cls.ruan_post.title = "Novwdfssdo edital do CERTBIO"
    cls.ruan_post.text = "At vero eos et accusamus et iusto odio dignissimos \
        emporibus autem quibusdam et aut officiis debitis aut rerum \
        necessitatibus saepe eveniet ut et voluptates repudiandae sint \
        et molestiae non recusandae. Itaque earum rerum hic tenetur sapiente \
        delectus, ut aut reiciendis voluptatibus maiores alias consequatur \
        aut perferendis doloribus asperiores repellat."
    cls.ruan_post.author = cls.ruan.key
    cls.ruan_post.institution = cls.certbio.key
    cls.ruan_post.put()
