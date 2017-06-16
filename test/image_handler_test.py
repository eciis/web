# -*- coding: utf-8 -*-
"""Image Handler Test."""

from io import BytesIO
from PIL import Image
import json

from test_base_handler import TestBaseHandler
from models.user import User
from models.institution import Institution
from handlers.image_handler import ImageHandler


def create_test_image(size):
    """Create a new image."""
    file = BytesIO()
    image = Image.new('RGBA', size=(size, size), color=(155, 0, 0))
    image.save(file, 'png')
    file.name = 'test.png'
    file.seek(0)
    return file


class ImageHandlerTest(TestBaseHandler):
    """Class of test image handler."""

    POST_IMAGE_URL = '/api/images'
    GET_IMAGE_URL = '/api/images/%s'

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(ImageHandlerTest, cls).setUp()
        cls.test.init_urlfetch_stub()
        cls.test.init_app_identity_stub()
        cls.test.init_blobstore_stub()
        cls.test.init_images_stub()
        app = cls.webapp2.WSGIApplication(
            [("/api/images", ImageHandler),
             ("/api/images/(.*)", ImageHandler),
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)
        initModels(cls)

    def test_store_image_lager_800(self):
        """Test storage image with a size greater than 800 in cloud storage."""
        self.os.environ['REMOTE_USER'] = 'luiz.silva@ccc.ufcg.edu.br'
        self.os.environ['USER_EMAIL'] = 'luiz.silva@ccc.ufcg.edu.br'
        image = create_test_image(2000)
        image = image.read()

        response = self.testapp.post(
            ImageHandlerTest.POST_IMAGE_URL,
            upload_files=[('image', 'test.png', image)])

        data = response._app_iter[0]
        data = json.loads(data)
        url_image = data['file_url']

        key_image = url_image.split('/')[-1]

        response = self.testapp.get(
            ImageHandlerTest.GET_IMAGE_URL % (key_image))
        data = response._app_iter
        image = data[0]

        self.assertEqual(
            self.images.Image(image).width, 800,
            "Image size muste be equal to 800")

    def test_store_image_smaller_800(self):
        """Test storage image with a size less than 800 in cloud storage."""
        self.os.environ['REMOTE_USER'] = 'luiz.silva@ccc.ufcg.edu.br'
        self.os.environ['USER_EMAIL'] = 'luiz.silva@ccc.ufcg.edu.br'
        image = create_test_image(500)
        image = image.read()

        response = self.testapp.post(
            ImageHandlerTest.POST_IMAGE_URL,
            upload_files=[('image', 'test.png', image)])

        data = response._app_iter[0]
        data = json.loads(data)
        url_image = data['file_url']

        key_image = url_image.split('/')[-1]

        response = self.testapp.get(
            ImageHandlerTest.GET_IMAGE_URL % (key_image))
        data = response._app_iter
        image = data[0]

        self.assertEqual(
            self.images.Image(image).width, 500,
            "Image size muste be equal to 500")


def initModels(cls):
    """Init the models."""
    # new User Luiz
    cls.luiz = User()
    cls.luiz.name = 'Luiz Fernando'
    cls.luiz.cpf = '089.675.908-90'
    cls.luiz.email = 'luiz.silva@ccc.ufcg.edu.br'
    cls.luiz.institutions = []
    cls.luiz.follows = []
    cls.luiz.institutions_admin = []
    cls.luiz.notifications = []
    cls.luiz.posts = []
    cls.luiz.put()
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
    cls.certbio.members = [cls.luiz.key]
    cls.certbio.followers = [cls.luiz.key]
    cls.certbio.posts = []
    cls.certbio.admin = cls.luiz.key
    cls.certbio.put()
