# -*- coding: utf-8 -*-
"""User request handler test."""

import json
from test_base_handler import TestBaseHandler
from models.user import User
from models.institution import Institution
from handlers.user_request_handler import UserRequestHandler

from mock import patch


class UserRequestHandlerTest(TestBaseHandler):
    """Test the handler UserRequestHandler."""

    REQUEST_URI = "/api/institutions/(.*)/requests/user"

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(UserRequestHandlerTest, cls).setUp()
        app = cls.webapp2.WSGIApplication(
            [(UserRequestHandlerTest.REQUEST_URI, UserRequestHandler),
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)
        initModels(cls)
        # Default authentication with Tiago
        cls.os.environ['REMOTE_USER'] = 'luiz.silva@ccc.ufcg.edu.br'
        cls.os.environ['USER_EMAIL'] = 'luiz.silva@ccc.ufcg.edu.br'

    @patch('utils.verify_token', return_value={'email': 'luiz.silva@ccc.ufcg.edu.br'})
    def test_post(self, verify_token):
        """Test method post of UserRequestHandler."""
        data = {
            'sender_key': self.luiz.key.urlsafe(),
            'is_request': True,
            'admin_key': self.mayza.key.urlsafe(),
            'institution_key': self.splab.key.urlsafe(),
            'type_of_invite': 'REQUEST_USER'
        }

        request = self.testapp.post_json(
            "/api/institutions/" + self.splab.key.urlsafe() + "/requests/user",
            data)

        request = json.loads(request._app_iter[0])

        self.assertEqual(
            request['sender'],
            self.luiz.email,
            'Expected sender email is luiz.silva@ccc.ufcg.edu.br')
        self.assertEqual(
            request['admin_name'],
            self.mayza.name,
            'Expected sender admin_name is Mayza Nunes')
        self.assertEqual(
            request['type_of_invite'],
            'REQUEST_USER',
            'Expected sender type_of_invite is REQUEST_USER')

    @patch('utils.verify_token', return_value={'email': 'luiz.silva@ccc.ufcg.edu.br'})
    def test_post_invalid_request_type(self, verify_token):
        """Test if an exception is thrown by passing an invalid request."""
        data = {
            'sender_key': self.luiz.key.urlsafe(),
            'is_request': True,
            'admin_key': self.mayza.key.urlsafe(),
            'institution_key': self.splab.key.urlsafe(),
            'type_of_invite': 'INVITE'
        }

        with self.assertRaises(Exception) as ex:
            self.testapp.post_json(
                "/api/institutions/" + self.splab.key.urlsafe() + "/requests/user",
                data)

        exception_message = get_message_exception(self, ex.exception.message)
        self.assertEqual(
            'Error! The type must be REQUEST_USER',
            exception_message,
            "Expected error message is Error! The type must be REQUEST_USER")


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
    cls.luiz = User()
    cls.luiz.name = 'Luiz Fernando'
    cls.luiz.cpf = '089.675.908-65'
    cls.luiz.email = 'luiz.silva@ccc.ufcg.edu.br'
    cls.luiz.institutions = []
    cls.luiz.follows = []
    cls.luiz.institutions_admin = []
    cls.luiz.notifications = []
    cls.luiz.posts = []
    cls.luiz.put()
    # new Institution SPLAB
    cls.splab = Institution()
    cls.splab.name = 'SPLAB'
    cls.splab.acronym = 'SPLAB'
    cls.splab.cnpj = '18.104.068/0001-56'
    cls.splab.legal_nature = 'public'
    cls.splab.address = 'Universidade Federal de Campina Grande'
    cls.splab.occupation_area = ''
    cls.splab.description = 'The mission of the Software Practices Laboratory (SPLab) \
            is to promote the development of the state-of-the-art in the \
            theory and practice of Software Engineering.'
    cls.splab.email = 'splab@ufcg.edu.br'
    cls.splab.phone_number = '(83) 3322 7865'
    cls.splab.members = [cls.mayza.key]
    cls.splab.followers = [cls.mayza.key]
    cls.splab.posts = []
    cls.splab.admin = cls.mayza.key
    cls.splab.put()


def get_message_exception(cls, exception):
    """Return only message of string exception."""
    cls.list_args = exception.split("\n")
    cls.dict = eval(cls.list_args[1])
    return cls.dict["msg"]
