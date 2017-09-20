# -*- coding: utf-8 -*-
"""Institution Request Handler Test."""

import json
from test_base_handler import TestBaseHandler
from models.user import User
from models.institution import Institution
from models.institution import Address
from models.request_institution import RequestInstitution
from handlers.institution_request_handler import InstitutionRequestHandler

from mock import patch


class InstitutionRequestHandlerTest(TestBaseHandler):
    """Institution Request Handler Test."""

    REQUEST_URI = "/api/requests/(.*)/institution"

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(InstitutionRequestHandlerTest, cls).setUp()
        app = cls.webapp2.WSGIApplication(
            [(InstitutionRequestHandlerTest.REQUEST_URI, InstitutionRequestHandler),
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)
        initModels(cls)


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
    # new Institution inst requested to be parent of inst test
    cls.inst_requested = Institution()
    cls.inst_requested.name = 'inst requested'
    cls.inst_requested.members = [cls.user_admin.key]
    cls.inst_requested.followers = [cls.user_admin.key]
    cls.inst_requested.admin = cls.other_user.key
    cls.inst_requested.address = cls.address
    cls.inst_requested.put()
    # Update Institutions admin by other user
    cls.other_user.institutions_admin = [cls.inst_requested.key]
    cls.other_user.put()
    # new Request
    cls.request = RequestInstitution()
    cls.request.sender_key = cls.other_user.key
    cls.request.is_request = True
    cls.request.admin_key = cls.user_admin.key
    cls.request.institution_key = cls.inst_test.key
    cls.request.institution_requested_key = cls.inst_requested.key
    cls.request.type_of_invite = 'REQUEST_INSTITUTION_PARENT'
    cls.request.put()
