# -*- coding: utf-8 -*-
"""Institution Parent request handler test."""

import json
import mocks

from test_base_handler import TestBaseHandler
from models.invite import Invite
from models import Address
from models.request_institution_parent import RequestInstitutionParent
from handlers.institution_parent_request_handler import InstitutionParentRequestHandler
from worker import AddAdminPermissionsInInstitutionHierarchy
from mock import patch
from test_base_handler import has_permissions
import permissions


class InstitutionParentRequestHandlerTest(TestBaseHandler):
    """Test the handler InstitutionChildrenRequestCollectionHandler."""

    REQUEST_URI = "/api/requests/(.*)/institution_parent"

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(InstitutionParentRequestHandlerTest, cls).setUp()
        app = cls.webapp2.WSGIApplication(
            [(InstitutionParentRequestHandlerTest.REQUEST_URI, InstitutionParentRequestHandler),
            ('/api/queue/add-admin-permissions', AddAdminPermissionsInInstitutionHierarchy)
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)
        
        # create models
        # new User
        cls.user_admin = mocks.create_user('useradmin@test.com')
        # Other user
        cls.other_user = mocks.create_user('otheruser@test.com')
        # new institution address
        cls.address = Address()
        cls.address.street = "street"
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
        cls.request = RequestInstitutionParent()
        cls.request.sender_key = cls.user_admin.key
        cls.request.is_request = True
        cls.request.admin_key = cls.user_admin.key
        cls.request.institution_key = cls.inst_test.key
        cls.request.institution_requested_key = cls.inst_requested.key
        cls.request.type_of_invite = 'REQUEST_INSTITUTION_PARENT'
        cls.request.put()

    
    def enqueue_task(self, handler_selector, params):
        """Method of mock enqueue tasks."""
        if handler_selector == 'add-admin-permissions':
            self.testapp.post('/api/queue/' + handler_selector, params=params)

    @patch.object(Invite, 'send_notification')
    @patch('utils.verify_token', return_value={'email': 'otheruser@test.com'})
    def test_put(self, verify_token, send_notification):
        """Test method put of InstitutionParentRequestHandler."""
        request = self.testapp.put_json(
            "/api/requests/%s/institution_parent" % self.request.key.urlsafe(),
            headers={'institution-authorization': self.inst_requested.key.urlsafe()}
        )

        request = json.loads(request._app_iter[0])

        institution = self.inst_requested.key.get()

        self.assertEqual(
            request['status'],
            'accepted',
            'Expected status from request must be accepted')
        self.assertEqual(
            institution.children_institutions[0], self.inst_test.key,
            "The children institution of inst test must be update to inst_requested")
        
        message = {
            "from": {
                "photo_url": self.other_user.photo_url,
                "name": self.other_user.name,
                "institution_name": self.request.institution_requested_key.get().name
            },
            "to": {
                "institution_name": self.request.institution_key.get().name
            },
            "current_institution": {
                "name": institution.name
            }
        }

        # Assert the notification was sent
        send_notification.assert_called_with(
            current_institution=self.inst_requested.key, 
            receiver_key=self.user_admin.key,
            notification_type='ACCEPT_INSTITUTION_LINK',
            message=json.dumps(message)
        )

    @patch('utils.verify_token', return_value={'email': 'useradmin@test.com'})
    def test_put_user_not_admin(self, verify_token):
        """Test put request with user is not admin."""
        with self.assertRaises(Exception) as ex:
            self.testapp.put(
            "/api/requests/%s/institution_parent" % self.request.key.urlsafe(),
            headers={'institution-authorization': self.inst_test.key.urlsafe()})

        exception_message = self.get_message_exception(ex.exception.message)
        expected_message = "Error! User is not allowed to accept link between institutions"
        self.assertEqual(
            expected_message,
            exception_message,
            "Expected error message is %s but was %s" % (expected_message, exception_message))

    @patch.object(Invite, 'send_notification')
    @patch('utils.verify_token', return_value={'email': 'otheruser@test.com'})
    def test_delete(self, verify_token, send_notification):
        """Test method delete of InstitutionParentRequestHandler."""
        self.testapp.delete(
            "/api/requests/%s/institution_parent" % self.request.key.urlsafe(),
            headers={'institution-authorization': self.inst_requested.key.urlsafe()}
        )

        institution = self.inst_requested.key.get()

        self.request = self.request.key.get()

        self.assertEqual(
            self.request.status,
            'rejected',
            'Expected status from request must be rejected')
        self.assertEqual(
            institution.children_institutions, [],
            "The list of children institution of inst requested is empty")

        message = {
            "from": {
                "photo_url": self.other_user.photo_url,
                "name": self.other_user.name,
                "institution_name": self.request.institution_requested_key.get().name
            },
            "to": {
                "institution_name": self.request.institution_key.get().name
            },
            "current_institution": {
                "name": institution.name
            }
        }

        # assert notfication was sent
        send_notification.assert_called_with(
            current_institution=self.inst_requested.key, 
            receiver_key=self.user_admin.key,
            notification_type='REJECT_INSTITUTION_LINK',
            message=json.dumps(message)
        )

    @patch('handlers.institution_parent_request_handler.enqueue_task')
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
        second_inst.admin = second_user.key
        third_inst.admin = third_user.key

        first_user.institutions_admin.append(first_inst.key)
        second_user.institutions_admin.append(second_inst.key)
        third_user.institutions_admin.append(third_inst.key)

        second_inst.parent_institution = first_inst.key
        third_inst.parent_institution = second_inst.key

        first_inst.children_institutions.append(second_inst.key)

        first_inst.put()
        second_inst.put()
        third_inst.put()

        first_user.put()
        second_user.put()
        third_user.put()
        second_user.add_permission(
            'answer_link_inst_request', second_inst.key.urlsafe())

        request = RequestInstitutionParent()
        request.admin_key = third_user.key
        request.sender_key = third_user.key
        request.institution_key = third_inst.key
        request.institution_requested_key = second_inst.key
        request.put()
        
        verify_token._mock_return_value = {'email': second_user.email[0]}
        second_user.add_institution(second_inst.key)
        enqueue_task.side_effect = self.enqueue_task

        self.assertFalse(has_permissions(
            first_user, third_inst.key.urlsafe(), permissions.DEFAULT_ADMIN_PERMISSIONS))
        self.assertFalse(has_permissions(
            second_user, third_inst.key.urlsafe(), permissions.DEFAULT_ADMIN_PERMISSIONS))

        self.testapp.put(
            "/api/requests/%s/institution_parent" % request.key.urlsafe(),
            headers={'institution-authorization': second_inst.key.urlsafe()}
        )

        first_user = first_user.key.get()
        second_user = second_user.key.get()
        third_user = third_user.key.get()

        self.assertTrue(has_permissions(
            first_user, third_inst.key.urlsafe(), permissions.DEFAULT_ADMIN_PERMISSIONS))
        self.assertTrue(has_permissions(
            second_user, third_inst.key.urlsafe(), permissions.DEFAULT_ADMIN_PERMISSIONS))
