# -*- coding: utf-8 -*-
"""Institution Children request handler test."""

import json
from test_base_handler import TestBaseHandler
from models.user import User
from models.institution import Institution
from models.request_institution_children import RequestInstitutionChildren
from handlers.institution_children_request_handler import InstitutionChildrenRequestHandler

from mock import patch


class InstitutionChildrenRequestHandlerTest(TestBaseHandler):
    """Test the handler InstitutionChildrenRequestCollectionHandler."""

    REQUEST_URI = "/api/requests/(.*)/institution_children"

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(InstitutionChildrenRequestHandlerTest, cls).setUp()
        app = cls.webapp2.WSGIApplication(
            [(InstitutionChildrenRequestHandlerTest.REQUEST_URI, InstitutionChildrenRequestHandler),
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)
        initModels(cls)

    @patch('utils.verify_token', return_value={'email': 'otheruser@test.com'})
    def test_put(self, verify_token):
        """Test method post of InstitutionChildrenRequestHandler."""
        request = self.testapp.put_json(
            "/api/requests/" + self.request.key.urlsafe() + "/institution_children")

        request = json.loads(request._app_iter[0])

        institution = self.inst_requested.key.get()

        self.assertEqual(
            request['status'],
            'accepted',
            'Expected status from request must be accepted')
        self.assertEqual(
            institution.parent_institution, self.inst_test.key,
            "The parent institution of inst requested must be update to inst test")


def initModels(cls):
    """Init the models."""
    # new User
    cls.user_admin = User()
    cls.user_admin.name = 'User Admin'
    cls.user_admin.email = 'useradmin@test.com'
    cls.user_admin.put()
    # Other user
    cls.other_user = User()
    cls.other_user.name = 'Other User'
    cls.other_user.email = 'otheruser@test.com'
    cls.other_user.put()
    # new Institution inst test
    cls.inst_test = Institution()
    cls.inst_test.name = 'inst test'
    cls.inst_test.members = [cls.user_admin.key]
    cls.inst_test.followers = [cls.user_admin.key]
    cls.inst_test.admin = cls.user_admin.key
    cls.inst_test.put()
    # new Institution inst requested to be parent of inst test
    cls.inst_requested = Institution()
    cls.inst_requested.name = 'inst requested'
    cls.inst_requested.members = [cls.user_admin.key]
    cls.inst_requested.followers = [cls.user_admin.key]
    cls.inst_requested.admin = cls.other_user.key
    cls.inst_requested.put()
    # Update Institutions admin by other user
    cls.other_user.institutions_admin = [cls.inst_requested.key]
    cls.other_user.put()
    # new Request
    cls.request = RequestInstitutionChildren()
    cls.request.sender_key = cls.other_user.key
    cls.request.is_request = True
    cls.request.admin_key = cls.user_admin.key
    cls.request.institution_key = cls.inst_test.key
    cls.request.institution_requested_key = cls.inst_requested.key
    cls.request.type_of_invite = 'REQUEST_INSTITUTION_CHILDREN'
    cls.request.put()
