# -*- coding: utf-8 -*-
"""Institution Parent Collection request handler test."""

import json
from test_base_handler import TestBaseHandler
from models.user import User
from models.institution import Institution
from models.institution import Address
from handlers.institution_parent_request_collection_handler import InstitutionParentRequestCollectionHandler

from mock import patch


class InstitutionParentRequestCollectionHandlerTest(TestBaseHandler):
    """Test the handler InstitutionParentRequestCollectionHandler."""

    REQUEST_URI = "/api/institutions/(.*)/requests/institution_parent"

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(InstitutionParentRequestCollectionHandlerTest, cls).setUp()
        app = cls.webapp2.WSGIApplication(
            [(InstitutionParentRequestCollectionHandlerTest.REQUEST_URI, InstitutionParentRequestCollectionHandler),
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)
        initModels(cls)

    @patch('utils.verify_token', return_value={'email': 'useradmin@test.com'})
    def test_post(self, verify_token):
        """Test method post of InstitutionParentRequestCollectionHandler."""
        data = {
            'sender_key': self.other_user.key.urlsafe(),
            'is_request': True,
            'admin_key': self.user_admin.key.urlsafe(),
            'institution_key': self.inst_test.key.urlsafe(),
            'institution_requested_key': self.inst_requested.key.urlsafe(),
            'type_of_invite': 'REQUEST_INSTITUTION_PARENT'
        }

        request = self.testapp.post_json(
            "/api/institutions/" + self.inst_test.key.urlsafe() + "/requests/institution_parent",
            data)

        request = json.loads(request._app_iter[0])

        institution = self.inst_test.key.get()

        self.assertEqual(
            request['sender'],
            self.other_user.email,
            'Expected sender email is other_user@test.com')
        self.assertEqual(
            request['admin_name'],
            self.user_admin.name,
            'Expected sender admin_name is User Admin')
        self.assertEqual(
            request['type_of_invite'],
            'REQUEST_INSTITUTION_PARENT',
            'Expected sender type_of_invite is REQUEST_INSTITUTION_PARENT')
        self.assertEqual(
            institution.parent_institution, self.inst_requested.key,
            "The parent institution of inst test must be update to inst_requested")

    @patch('utils.verify_token', return_value={'email': 'otheruser@test.com'})
    def test_post_user_not_admin(self, verify_token):
        """Test post request with user is not admin."""

        data = {
            'sender_key': self.other_user.key.urlsafe(),
            'is_request': True,
            'admin_key': self.user_admin.key.urlsafe(),
            'institution_key': self.inst_test.key.urlsafe(),
            'institution_requested_key': self.inst_requested.key.urlsafe(),
            'type_of_invite': 'REQUEST_INSTITUTION_PARENT'
        }

        with self.assertRaises(Exception) as ex:
            self.testapp.post_json(
                "/api/institutions/" + self.inst_test.key.urlsafe() + "/requests/institution_parent",
                data)

        exception_message = self.get_message_exception(ex.exception.message)
        self.assertEqual(
            "Error! User is not admin",
            exception_message,
            "Expected error message is Error! User is not admin")



def initModels(cls):
    """Init the models."""
    # new User
    cls.user_admin = User()
    cls.user_admin.name = 'User Admin'
    cls.user_admin.email = ['useradmin@test.com']
    cls.user_admin.put()
    # Other user
    cls.other_user = User()
    cls.other_user.name = 'Other User'
    cls.other_user.email = ['otheruser@test.com']
    cls.other_user.put()
    # new institution address
    cls.address = Address()
    cls.address.street = "street"
    # new Institution inst test
    cls.inst_test = Institution()
    cls.inst_test.name = 'inst test'
    cls.inst_test.members = [cls.user_admin.key]
    cls.inst_test.followers = [cls.user_admin.key]
    cls.inst_test.admin = cls.user_admin.key
    cls.inst_test.address = cls.address
    cls.inst_test.put()
    # Update institutions admin from User admin
    cls.user_admin.institutions_admin = [cls.inst_test.key]
    cls.user_admin.put()
    # new Institution inst requested to be parent of inst test
    cls.inst_requested = Institution()
    cls.inst_requested.name = 'inst requested'
    cls.inst_requested.members = [cls.user_admin.key]
    cls.inst_requested.followers = [cls.user_admin.key]
    cls.inst_requested.admin = cls.user_admin.key
    cls.inst_requested.address = cls.address
    cls.inst_requested.put()
