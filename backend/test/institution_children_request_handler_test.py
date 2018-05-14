# -*- coding: utf-8 -*-
"""Institution Children request handler test."""

import json
import mocks

from test_base_handler import TestBaseHandler
from models import User
from models import Institution
from models import Address
from models import RequestInstitutionChildren
from handlers.institution_children_request_handler import InstitutionChildrenRequestHandler
from worker import AddAdminPermissionsInInstitutionHierarchy
from test_base_handler import has_permissions
import permissions
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
             ('/api/queue/add-admin-permissions', AddAdminPermissionsInInstitutionHierarchy)
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
        cls.user_admin.add_institution(cls.inst_test.key)
        cls.inst_test.put()
        # new Institution inst requested to be parent of inst test
        cls.inst_requested = mocks.create_institution()
        cls.inst_requested.admin = cls.other_user.key
        cls.other_user.add_institution(cls.inst_requested.key)
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


    def enqueue_task(self, handler_selector, params):
        """Method of mock enqueue tasks."""
        if handler_selector == 'add-admin-permissions':
            self.testapp.post('/api/queue/' + handler_selector, params=params)


    @patch('service_messages.send_message_notification')
    @patch('utils.verify_token', return_value={'email': 'otheruser@test.com'})
    def test_put(self, verify_token, mock_method):
        """Test method post of InstitutionChildrenRequestHandler."""
        request = self.testapp.put_json(
            "/api/requests/%s/institution_children" % self.request.key.urlsafe(),
            headers={"institution-authorization": self.inst_requested.key.urlsafe()}
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

        self.assertTrue(
            mock_method.assert_called,
            "Should call the send_message_notification"
        )

    @patch('utils.verify_token', return_value={'email': 'useradmin@test.com'})
    def test_put_user_not_admin(self, verify_token):
        """Test put request with user is not admin."""
        with self.assertRaises(Exception) as ex:
            self.testapp.put(
                "/api/requests/%s/institution_children" % self.request.key.urlsafe(),
                headers={"institution-authorization": self.inst_test.key.urlsafe()}
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
            "/api/requests/%s/institution_children" % self.request.key.urlsafe(),
            headers={"institution-authorization": self.inst_requested.key.urlsafe()}
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

    @patch('handlers.institution_children_request_handler.enqueue_task')
    @patch('utils.verify_token', return_value={'email': 'user@example.com'})
    def test_add_admin_permission_in_institution_hierarchy(self, verify_token, enqueue_task):
        """Test add admin permissions in institution hierarchy."""
        first_user = mocks.create_user()
        second_user = mocks.create_user()
        third_user = mocks.create_user()

        first_inst = mocks.create_institution()
        second_inst = mocks.create_institution()
        third_inst = mocks.create_institution()

        first_inst.admin = first_user.key
        first_user.add_institution(first_inst.key)
        second_inst.admin = second_user.key
        second_user.add_institution(second_inst.key)
        third_inst.admin = third_user.key
        third_user.add_institution(third_inst.key)

        first_user.institutions_admin.append(first_inst.key)
        second_user.institutions_admin.append(second_inst.key)
        third_user.institutions_admin.append(third_inst.key)

        second_inst.parent_institution = first_inst.key

        first_inst.children_institutions.append(second_inst.key)
        second_inst.children_institutions.append(third_inst.key)

        third_user.add_permission('answer_link_inst_request', third_inst.key.urlsafe())

        first_inst.put()
        second_inst.put()
        third_inst.put()

        first_user.put()
        second_user.put()
        third_user.put()

        request = RequestInstitutionChildren()
        request.admin_key = second_user.key
        request.sender_key = second_user.key
        request.institution_key = second_inst.key
        request.institution_requested_key = third_inst.key
        request.put()
        
        verify_token._mock_return_value = {'email': third_user.email[0]}
        enqueue_task.side_effect = self.enqueue_task

        self.assertFalse(has_permissions(first_user, third_inst.key.urlsafe(), permissions.DEFAULT_ADMIN_PERMISSIONS))
        self.assertFalse(has_permissions(
            second_user, third_inst.key.urlsafe(), permissions.DEFAULT_ADMIN_PERMISSIONS))

        self.testapp.put(
            "/api/requests/%s/institution_children" % request.key.urlsafe(),
            headers={"institution-authorization": third_inst.key.urlsafe()}
        )

        first_user = first_user.key.get()
        second_user = second_user.key.get()
        third_user = third_user.key.get()

        self.assertTrue(has_permissions(
            first_user, third_inst.key.urlsafe(), permissions.DEFAULT_ADMIN_PERMISSIONS))
        self.assertTrue(has_permissions(
            second_user, third_inst.key.urlsafe(), permissions.DEFAULT_ADMIN_PERMISSIONS))
