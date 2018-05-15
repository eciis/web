"""Tests of model request institution children."""

from ..test_base import TestBase
from models import RequestInstitutionChildren
from custom_exceptions.fieldException import FieldException

from .. import mocks


class RequestInstitutionChildrenTest(TestBase):
    """Class request institution parent tests."""

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        cls.test = cls.testbed.Testbed()
        cls.test.activate()
        cls.policy = cls.datastore.PseudoRandomHRConsistencyPolicy(
            probability=1)
        cls.test.init_datastore_v3_stub(consistency_policy=cls.policy)
        cls.test.init_memcache_stub()
    
        """Initialize models"""
        cls.admin = mocks.create_user()
        cls.other_user = mocks.create_user()
        cls.institution = mocks.create_institution()
        cls.requested_institution = mocks.create_institution()


    def test_create(self):
        """Test create new request."""
        data = {
            'sender_key': self.admin.key.urlsafe(),
            'is_request': True,
            'admin_key': self.admin.key.urlsafe(),
            'institution_key': self.institution.key.urlsafe(),
            'institution_requested_key': self.requested_institution.key.urlsafe()
        }

        request = RequestInstitutionChildren.create(data)
        request.put()

        self.assertEqual(
            request.admin_key,
            self.admin.key,
            'The request sender should be the admin')

        self.assertTrue(
            request.is_request,
            "The atribute is_request should be True")

        self.assertEqual(
            request.institution_key,
            self.institution.key,
            'The institution key should be equal to the expected one')

        self.assertEqual(
            request.institution_requested_key,
            self.requested_institution.key,
            'The institution requested key should be equal to the expected one')


    def test_create_for_invited_institution(self):
        """Test create a request for an institution already invited."""
        data = {
            'sender_key': self.other_user.key.urlsafe(),
            'is_request': True,
            'admin_key': self.admin.key.urlsafe(),
            'institution_key': self.institution.key.urlsafe(),
            'institution_requested_key': self.requested_institution.key.urlsafe(),
            'type_of_invite': 'REQUEST_INSTITUTION_PARENT'
        }

        # creates and saves the request
        request = RequestInstitutionChildren.create(data)
        request.put()

        # try to create the same request
        with self.assertRaises(FieldException) as ex:
            RequestInstitutionChildren.create(data)

        self.assertEqual(
            'The requested institution has already been invited',
            str(ex.exception),
            'The exception message is not equal to the expected one')
    
    
    def test_create_request_for_institution_linked(self):
        """Test create request for a linked institution."""
        self.institution.add_child(self.requested_institution.key)
        self.requested_institution.set_parent(self.institution.key)

        data = {
            'sender_key': self.other_user.key.urlsafe(),
            'is_request': True,
            'admin_key': self.admin.key.urlsafe(),
            'institution_key': self.institution.key.urlsafe(),
            'institution_requested_key': self.requested_institution.key.urlsafe(),
            'type_of_invite': 'REQUEST_INSTITUTION_PARENT'
        }

        with self.assertRaises(FieldException) as ex:
            RequestInstitutionChildren.create(data)

        self.assertEqual(
            'The institutions has already been connected.',
            str(ex.exception),
            'Expected message is The institutions has already been connected')


    def test_make(self):
        """Test method make for children institution request."""
        data = {
            'sender_key': self.other_user.key.urlsafe(),
            'is_request': True,
            'admin_key': self.admin.key.urlsafe(),
            'institution_key': self.institution.key.urlsafe(),
            'institution_requested_key': self.requested_institution.key.urlsafe(),
            'type_of_invite': 'REQUEST_INSTITUTION_CHILDREN'
        }

        request = RequestInstitutionChildren.create(data)
        request.put()

        expected_maked_request = {
            'status': 'sent',
            'institution_admin': {
                'name': self.institution.name
            },
            'sender': self.other_user.email,
            'institution_requested_key': self.requested_institution.key.urlsafe(),
            'admin_name': self.admin.name,
            'key': request.key.urlsafe(),
            'type_of_invite': 'REQUEST_INSTITUTION_CHILDREN',
            'institution_key': self.institution.key.urlsafe(),
            'institution': {
                'name': self.institution.name,
                'key': self.institution.key.urlsafe(),
                'address': self.institution.address
            },
        }

        maked_request = request.make()
        for dict_key in expected_maked_request.keys():
            expected, actual = None, None
            if dict_key == "institution":
                dict_institution = expected_maked_request[dict_key]
                request_institution = maked_request[dict_key]
                actual = str(request_institution['key']).encode('utf-8')
                expected = str(dict_institution['key']).encode('utf-8')
            else:
                expected = str(expected_maked_request[dict_key]).encode('utf-8')
                actual = str(maked_request[dict_key]).encode('utf-8')

            self.assertEqual(actual, expected, "%s is not equal to %s" % (actual, expected))
