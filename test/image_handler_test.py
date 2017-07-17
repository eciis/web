# -*- coding: utf-8 -*-
"""Image Handler Test."""

from io import BytesIO
from PIL import Image
import json

from test_base_handler import TestBaseHandler
from models.user import User
from models.institution import Institution
from handlers.image_handler import ImageHandler
from handlers.user_handler import UserHandler

from mock import patch


def create_in_memory_image_file(size):
    """Create a new image."""
    file = BytesIO()
    image = Image.new('RGBA', size=(size, size), color=(155, 0, 0))
    image.save(file, 'png')
    file.name = 'test.png'
    file.seek(0)
    return file


class ImageHandlerTest(TestBaseHandler):
    """Class of test image handler."""

    USER_URI = '/api/user'
    POST_IMAGE_URI = '/api/images'
    GET_IMAGE_URI_PATTERN = '/api/images/%s'
    GET_IMAGE_URI = '/api/images/(.*)'
    INDEX_DATA = 0
    INDEX_KEY_IMAGE = -1
    MAXIMUM_SIZE = 800
    EXPECTED_FILENAME = "test.png"
    KEY_FORM_DATA = "image"
    KEY_URL = "file_url"
    INDEX_TUPLE_FILENAME = 2
    INDEX_FILENAME = 1

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(ImageHandlerTest, cls).setUp()
        cls.test.init_urlfetch_stub()
        cls.test.init_blobstore_stub()
        cls.test.init_images_stub()
        cls.test.init_files_stub()
        app = cls.webapp2.WSGIApplication(
            [(ImageHandlerTest.POST_IMAGE_URI, ImageHandler),
             (ImageHandlerTest.GET_IMAGE_URI, ImageHandler),
             (ImageHandlerTest.USER_URI, UserHandler)
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)
        initModels(cls)

    @patch('utils.verify_token', return_value={'email': 'mayzabeel@gmail.com'})
    def test_store_image_larger_then_maximum_size(self, verify_token):
        """Test storage image with a size greater than 800 in cloud storage."""
        SIZE_IMAGE = 2000
        EXPECTED_SIZE = ImageHandlerTest.MAXIMUM_SIZE

        image = create_in_memory_image_file(SIZE_IMAGE)
        image = image.read()

        response = self.testapp.post(
            ImageHandlerTest.POST_IMAGE_URI,
            upload_files=[(
                ImageHandlerTest.KEY_FORM_DATA,
                ImageHandlerTest.EXPECTED_FILENAME,
                image)
            ])

        data = response._app_iter[ImageHandlerTest.INDEX_DATA]
        data = json.loads(data)
        url_image = data[ImageHandlerTest.KEY_URL]

        key_image = url_image.split('/')[ImageHandlerTest.INDEX_KEY_IMAGE]

        response = self.testapp.get(
            ImageHandlerTest.GET_IMAGE_URI_PATTERN % (key_image))
        headers = response._headers._items
        tuple_filename = headers[ImageHandlerTest.INDEX_TUPLE_FILENAME]
        filename = tuple_filename[ImageHandlerTest.INDEX_FILENAME]
        data = response._app_iter
        image = data[ImageHandlerTest.INDEX_DATA]

        self.assertEqual(
            self.images.Image(image).width, EXPECTED_SIZE,
            "Image size must be equal to 800")
        self.assertEqual(
            filename,
            ImageHandlerTest.EXPECTED_FILENAME,
            "Image name must be equal to test.png")

    @patch('utils.verify_token', return_value={'email': 'mayzabeel@gmail.com'})
    def test_store_image_smaller_then_maximum_size(self, verify_token):
        """Test storage image with a size less than 800 in cloud storage."""
        SIZE_IMAGE = 500
        LIST_URI_IMAGES_USER = 'uploaded_images'

        image = create_in_memory_image_file(SIZE_IMAGE)
        image = image.read()

        response = self.testapp.post(
            ImageHandlerTest.POST_IMAGE_URI,
            upload_files=[(
                ImageHandlerTest.KEY_FORM_DATA,
                ImageHandlerTest.EXPECTED_FILENAME,
                image)
            ])

        data = response._app_iter[ImageHandlerTest.INDEX_DATA]
        data = json.loads(data)
        url_image = data[ImageHandlerTest.KEY_URL]
        expcted_list = [url_image]

        response = self.testapp.get(ImageHandlerTest.USER_URI)
        current_user = response._app_iter[ImageHandlerTest.INDEX_DATA]
        current_user = json.loads(current_user)
        uploaded_images = current_user[LIST_URI_IMAGES_USER]

        self.assertEqual(uploaded_images, expcted_list)

    @patch('utils.verify_token', return_value={'email': 'mayzabeel@gmail.com'})
    def test_add_image_in_user(self, verify_token):
        """Test storage image and add in list of uploaded images."""
        SIZE_IMAGE = 500
        EXPECTED_SIZE = 500

        image = create_in_memory_image_file(SIZE_IMAGE)
        image = image.read()

        response = self.testapp.post(
            ImageHandlerTest.POST_IMAGE_URI,
            upload_files=[(
                ImageHandlerTest.KEY_FORM_DATA,
                ImageHandlerTest.EXPECTED_FILENAME,
                image)
            ])

        data = response._app_iter[ImageHandlerTest.INDEX_DATA]
        data = json.loads(data)
        url_image = data[ImageHandlerTest.KEY_URL]

        key_image = url_image.split('/')[ImageHandlerTest.INDEX_KEY_IMAGE]

        response = self.testapp.get(
            ImageHandlerTest.GET_IMAGE_URI_PATTERN % (key_image))
        headers = response._headers._items
        tuple_filename = headers[ImageHandlerTest.INDEX_TUPLE_FILENAME]
        filename = tuple_filename[ImageHandlerTest.INDEX_FILENAME]

        data = response._app_iter
        image = data[ImageHandlerTest.INDEX_DATA]

        self.assertEqual(
            self.images.Image(image).width, EXPECTED_SIZE,
            "Image size must be equal to 500")
        self.assertEqual(
            filename,
            ImageHandlerTest.EXPECTED_FILENAME,
            "Image name must be equal to test.png")


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
