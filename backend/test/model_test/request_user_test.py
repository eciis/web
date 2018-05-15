# -*- coding: utf-8 -*-
"""Tests of model request user."""

from ..test_base import TestBase
from models import RequestUser
from custom_exceptions.fieldException import FieldException
from .. import mocks


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

    def test_create_request(self):
        """Test create new request."""
        admin_user = mocks.create_user('adminuser@test.com')
        other_user = mocks.create_user('otheruser@test.com')
        inst_test = mocks.create_institution()
        admin_user.institutions_admin = [inst_test.key]
        inst_test.admin = admin_user.key
        admin_user.put()
        inst_test.put()
        data = {
            'sender_key': other_user.key.urlsafe(),
            'is_request': True,
            'admin_key': admin_user.key.urlsafe(),
            'institution_key': inst_test.key.urlsafe()
        }

        request = RequestUser.create(data)
        request.put()

        self.assertEqual(
            request.sender_key,
            other_user.key,
            'The sender of request expected was other user')

        self.assertTrue(
            request.is_request,
            "The atribute is_request must be equal True")

        self.assertEqual(
            request.admin_key,
            admin_user.key,
            'The admin of institution expected was Admin User')

        self.assertEqual(
            request.institution_key,
            inst_test.key,
            'The key of institution expected was inst test')

    def test_create_invalid_request(self):
        """Test create invalid request."""
        admin_user = mocks.create_user('adminuser@test.com')
        other_user = mocks.create_user('otheruser@test.com')
        inst_test = mocks.create_institution()
        admin_user.institutions_admin = [inst_test.key]
        inst_test.admin = admin_user.key
        admin_user.put()
        inst_test.put()
        data = {
            'sender_key': other_user.key.urlsafe(),
            'is_request': True,
            'admin_key': admin_user.key.urlsafe(),
            'institution_key': inst_test.key.urlsafe()
        }

        request = RequestUser.create(data)
        request.put()

        with self.assertRaises(FieldException) as ex:
            data = {
                'sender_key': other_user.key.urlsafe(),
                'is_request': True,
                'admin_key': admin_user.key.urlsafe(),
                'institution_key': inst_test.key.urlsafe()
            }

            RequestUser.create(data)

        self.assertEqual(
            'The sender is already invited',
            str(ex.exception),
            'Expected message is The sender is already invited')

    def test_make(self):
        """Test method make."""
        admin_user = mocks.create_user('adminuser@test.com')
        other_user = mocks.create_user('otheruser@test.com')
        inst_test = mocks.create_institution()
        admin_user.institutions_admin = [inst_test.key]
        inst_test.admin = admin_user.key
        admin_user.put()
        inst_test.put()
        data = {
            'sender_key': other_user.key.urlsafe(),
            'is_request': True,
            'admin_key': admin_user.key.urlsafe(),
            'institution_key': inst_test.key.urlsafe(),
            'office': 'teacher',
            'sender_name': 'other_user',
            'institutional_email': 'otheruser@inst_test.com'
        }

        request = RequestUser.create(data)
        request.put()

        REQUIRED_PROPERTIES = ['name', 'address', 'description',
                               'key', 'photo_url', 'institutional_email',
                               'phone_number', 'email', 'trusted']

        make = {
            'status': 'sent',
            'institution_admin': {
                'name': inst_test.name
            },
            'sender': other_user.email,
            'admin_name': admin_user.name,
            'key': request.key.urlsafe(),
            'institution': inst_test.make(REQUIRED_PROPERTIES),
            'type_of_invite': 'REQUEST_USER',
            'institution_key': inst_test.key.urlsafe(),
            'office': 'teacher',
            'sender_name': 'other_user',
            'sender_key': other_user.key.urlsafe(),
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
