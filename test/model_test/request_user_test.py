# -*- coding: utf-8 -*-
"""Tests of model request user."""

from ..test_base import TestBase
from models.request_user import RequestUser
from models.institution import Institution
from custom_exceptions.fieldException import FieldException
from models.user import User


class RequestUserTest(TestBase):
    """Class request user tests."""

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        cls.test = cls.testbed.Testbed()
        cls.test.activate()
        cls.policy = cls.datastore.PseudoRandomHRConsistencyPolicy(
            probability=1)
        cls.test.init_datastore_v3_stub(consistency_policy=cls.policy)
        cls.test.init_memcache_stub()
        initModels(cls)

    def test_create_request(self):
        """Test create new request."""
        data = {
            'sender_key': self.luiz.key.urlsafe(),
            'is_request': True,
            'admin_key': self.mayza.key.urlsafe(),
            'institution_key': self.certbio.key.urlsafe()
        }

        request = RequestUser.create(data)
        request.put()

        self.assertEqual(
            request.sender_key,
            self.luiz.key,
            'The sender of request expected was Luiz')

        self.assertTrue(
            request.is_request,
            "The atribute is_request must be equal True")

        self.assertEqual(
            request.admin_key,
            self.mayza.key,
            'The admin of institution expected was Mayza')

        self.assertEqual(
            request.institution_key,
            self.certbio.key,
            'The key of institution expected was CERTBIO')


def initModels(cls):
    """Init the models."""
    # new Institution CERTBIO
    cls.certbio = Institution()
    cls.certbio.name = 'CERTBIO'
    cls.certbio.acronym = 'CERTBIO'
    cls.certbio.cnpj = '18.104.068/0001-86'
    cls.certbio.legal_nature = 'public'
    cls.certbio.address = 'Universidade Federal de Campina Grande'
    cls.certbio.occupation_area = ''
    cls.certbio.description = 'Ensaio Químico'
    cls.certbio.email = 'certbio@ufcg.edu.br'
    cls.certbio.phone_number = '(83) 3322 4455'
    cls.certbio.members = []
    cls.certbio.followers = []
    cls.certbio.posts = []
    cls.certbio.put()
    # new User Mayza
    cls.mayza = User()
    cls.mayza.name = 'Mayza Nunes'
    cls.mayza.cpf = '089.675.908-90'
    cls.mayza.email = 'mayzabeel@gmail.com'
    cls.mayza.institutions = [cls.certbio.key]
    cls.mayza.follows = []
    cls.mayza.institutions_admin = [cls.certbio.key]
    cls.mayza.notifications = []
    cls.mayza.posts = []
    cls.mayza.put()

    # new User inactive Luiz
    cls.luiz = User()
    cls.luiz.name = 'Luiz'
    cls.luiz.cpf = '089.675.908-65'
    cls.luiz.email = 'luiz@ccc.ufcg.edu.br'
    cls.luiz.institutions = []
    cls.luiz.follows = []
    cls.luiz.institutions_admin = []
    cls.luiz.notifications = []
    cls.luiz.posts = []
    cls.luiz.put()
