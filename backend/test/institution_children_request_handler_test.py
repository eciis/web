# -*- coding: utf-8 -*-
"""Institution Children request handler test."""

import json
import mocks

from test_base_handler import TestBaseHandler
from models.user import User
from models.institution import Institution
from models.institution import Address
from models.request_institution_children import RequestInstitutionChildren
from handlers.institution_children_request_handler import InstitutionChildrenRequestHandler

from mock import patch

CURRENT_INSTITUTION = {'name': 'currentInstitution'}
CURRENT_INSTITUTION_STRING = json.dumps(CURRENT_INSTITUTION)    

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
        
        # create models
        # new User
        cls.user_admin = mocks.create_user('useradmin@test.com')
        # Other user
        cls.other_user = mocks.create_user('otheruser@test.com')
        # new Institution inst test
        cls.inst_test = mocks.create_institution()
        cls.inst_test.admin = cls.user_admin.key
        cls.inst_test.put()
        # new Institution inst requested to be parent of inst test
        cls.inst_requested = mocks.create_institution()
        cls.inst_requested.admin = cls.other_user.key
        cls.inst_requested.put()
        # Update Institutions admin by other user
        cls.other_user.add_permission("answer_link_inst_request", cls.inst_requested.key.urlsafe())
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

    @patch('service_messages.send_message_notification')
    @patch('utils.verify_token', return_value={'email': 'otheruser@test.com'})
    def test_put(self, verify_token, mock_method):
        """Test method post of InstitutionChildrenRequestHandler."""
        request = self.testapp.put_json(
            "/api/requests/%s/institution_children?currentInstitution=%s"
            % (self.request.key.urlsafe(), CURRENT_INSTITUTION_STRING)
        )

        request = json.loads(request._app_iter[0])

        institution = self.inst_requested.key.get()

        self.assertEqual(
            request['status'],
            'accepted',
            'Expected status from request must be accepted'
        )

        self.assertEqual(
            institution.parent_institution, self.inst_test.key,
            "The parent institution of inst requested must be update to inst test"
        )

        # update inst_test
        self.inst_test = self.inst_test.key.get()
        
        self.assertEqual(
            self.inst_test.children_institutions[0], institution.key,
            "The institution inst_test must have institution as child"
        )

        self.assertTrue(
            mock_method.assert_called,
            "Should call the send_message_notification"
        )

    @patch('utils.verify_token', return_value={'email': 'useradmin@test.com'})
    def test_put_user_not_admin(self, verify_token):
        """Test put request with user is not admin."""
        with self.assertRaises(Exception) as ex:
            self.testapp.put(
                "/api/requests/%s/institution_children?currentInstitution=%s"
                % (self.request.key.urlsafe(), CURRENT_INSTITUTION_STRING)
            )

        exception_message = self.get_message_exception(ex.exception.message)
        self.assertEqual(
            "Error! User is not allowed to accept link between institutions",
            exception_message,
            "Expected error message is Error! User is not allowed to accept link between institutions")

    @patch('service_messages.send_message_notification')
    @patch('utils.verify_token', return_value={'email': 'otheruser@test.com'})
    def test_delete(self, verify_token, mock_method):
        """Test method post of InstitutionChildrenRequestHandler."""
        self.testapp.delete(
            "/api/requests/%s/institution_children?currentInstitution=%s"
            % (self.request.key.urlsafe(), CURRENT_INSTITUTION_STRING)
        )

        institution = self.inst_requested.key.get()

        self.request = self.request.key.get()

        self.assertEqual(
            self.request.status,
            'rejected',
            'Expected status from request must be rejected')
        self.assertEqual(
            institution.parent_institution, None,
            "The parent institution of inst requested is None")

        self.assertTrue(mock_method.assert_called,
                        "Should call the send_message_notification")
