# -*- coding: utf-8 -*-
"""Tests of model request user."""

from ..test_base import TestBase
from models.request_user import RequestUser
from models.institution import Institution
from models.institution import Address
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
            'sender_key': self.other_user.key.urlsafe(),
            'is_request': True,
            'admin_key': self.admin_user.key.urlsafe(),
            'institution_key': self.inst_test.key.urlsafe()
        }

        request = RequestUser.create(data)
        request.put()

        self.assertEqual(
            request.sender_key,
            self.other_user.key,
            'The sender of request expected was other user')

        self.assertTrue(
            request.is_request,
            "The atribute is_request must be equal True")

        self.assertEqual(
            request.admin_key,
            self.admin_user.key,
            'The admin of institution expected was Admin User')

        self.assertEqual(
            request.institution_key,
            self.inst_test.key,
            'The key of institution expected was inst test')

    def test_create_invalid_request(self):
        """Test cretae invalid request."""
        data = {
            'sender_key': self.other_user.key.urlsafe(),
            'is_request': True,
            'admin_key': self.admin_user.key.urlsafe(),
            'institution_key': self.inst_test.key.urlsafe()
        }

        request = RequestUser.create(data)
        request.put()

        with self.assertRaises(FieldException) as ex:
            data = {
                'sender_key': self.other_user.key.urlsafe(),
                'is_request': True,
                'admin_key': self.admin_user.key.urlsafe(),
                'institution_key': self.inst_test.key.urlsafe()
            }

            RequestUser.create(data)

        self.assertEqual(
            'The sender is already invited',
            str(ex.exception),
            'Expected message is The sender is already invited')

        with self.assertRaises(FieldException) as ex:
            data = {
                'sender_key': self.admin_user.key.urlsafe(),
                'is_request': True,
                'admin_key': self.other_user.key.urlsafe(),
                'institution_key': self.inst_test.key.urlsafe()
            }

            RequestUser.create(data)

        self.assertEqual(
            'The sender is already a member',
            str(ex.exception),
            'Expected message is The sender is already a member')

    def test_make(self):
        """Test method make."""
        data = {
            'sender_key': self.other_user.key.urlsafe(),
            'is_request': True,
            'admin_key': self.admin_user.key.urlsafe(),
            'institution_key': self.inst_test.key.urlsafe(),
            'office': 'teacher',
            'sender_name': 'other_user',
            'institutional_email': 'otheruser@inst_test.com'
        }

        request = RequestUser.create(data)
        request.put()

        make = {
            'status': 'sent',
            'institution_admin': {
                'name': self.inst_test.name
            },
            'sender': self.other_user.email,
            'admin_name': self.admin_user.name,
            'key': request.key.urlsafe(),
            'institution': {
                'name': 'inst test',
                'key': self.inst_test.key.urlsafe(),
                'address': dict(self.address)
            },
            'type_of_invite': 'REQUEST_USER',
            'institution_key': self.inst_test.key.urlsafe(),
            'office': 'teacher',
            'sender_name': 'other_user',
            'institutional_email': 'otheruser@inst_test.com'
        }

        request_make = request.make()
        for key in make.keys():
            if key == "institution":
                make_institution = make[key]
                request_institution = request_make[key]
                for inst_key in make_institution.keys():
                    self.assertEqual(
                        str(make_institution[inst_key]).encode('utf-8'),
                        str(request_institution[inst_key]).encode('utf-8'),
                        "The make object must be equal to variable make"
                    )
            else:
                self.assertEqual(
                    str(make[key]).encode('utf-8'),
                    str(request_make[key]).encode('utf-8'),
                    "The make object must be equal to variable make"
                )


def initModels(cls):
    """Init the models."""
    # new Institution Address
    cls.address = Address()
    cls.address.number = '01'
    cls.address.street = 'street'
    cls.address.neighbourhood = 'neighbourhood'
    cls.address.city = 'city'
    cls.address.state = 'state'
    cls.address.city = 'city'
    cls.address.cep = '000'
    cls.address.country = 'country'
    # new Institution inst test
    cls.inst_test = Institution()
    cls.inst_test.name = 'inst test'
    cls.inst_test.address = cls.address
    cls.inst_test.put()
    # new User admin user
    cls.admin_user = User()
    cls.admin_user.name = 'Admin User'
    cls.admin_user.email = ['adminuser@test.com']
    cls.admin_user.institutions = [cls.inst_test.key]
    cls.admin_user.institutions_admin = [cls.inst_test.key]
    cls.admin_user.put()
    # update institution
    cls.inst_test.members.append(cls.admin_user.key)
    cls.inst_test.put()
    # new User inactive other user
    cls.other_user = User()
    cls.other_user.name = 'other user'
    cls.other_user.email = ['otheruser@test.com']
    cls.other_user.put()
