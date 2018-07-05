# -*- coding: utf-8 -*-
"""Institution Children handler test."""

from ..test_base_handler import TestBaseHandler
from handlers import InstitutionChildrenHandler
from worker import RemoveAdminPermissionsInInstitutionHierarchy
from mock import patch
from .. import mocks
import permissions
import json
from ..test_base_handler import has_permissions


class InstitutionChildrenHandlerTest(TestBaseHandler):

    @classmethod
    def setUp(cls):
        super(InstitutionChildrenHandlerTest, cls).setUp()
        app = cls.webapp2.WSGIApplication(
            [("/api/institutions/(.*)/hierarchy/(.*)/institution_children", InstitutionChildrenHandler),
            ('/api/queue/remove-admin-permissions', RemoveAdminPermissionsInInstitutionHierarchy)
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)
    
    def enqueue_task(self, handler_selector, params):
        """Method of mock enqueue tasks."""
        if handler_selector == 'add-admin-permissions' or handler_selector == 'remove-admin-permissions':
            self.testapp.post('/api/queue/' + handler_selector, params=params)
    
    @patch('util.notification.send_message_notification')
    @patch('util.login_service.verify_token')
    @patch('handlers.institution_children_handler.enqueue_task')
    def test_delete_parent_connection(self, enqueue_task, verify_token, send_message_notification):
        """Test delete method with isParent=true."""
        enqueue_task.side_effect = self.enqueue_task
        # Assert the initial conditions
        admin = mocks.create_user()
        otheruser = mocks.create_user()
        institution = mocks.create_institution()
        otherinst = mocks.create_institution()
        institution.children_institutions.append(otherinst.key)
        otherinst.parent_institution = institution.key
        institution.admin = admin.key
        otherinst.admin = otheruser.key
        institution.put()
        otherinst.put()
        otheruser.add_institution(otherinst.key)
        otheruser.add_permission("remove_link", otherinst.key.urlsafe())
        self.assertTrue(otherinst.key in institution.children_institutions)
        self.assertTrue(otherinst.parent_institution == institution.key)

        verify_token._mock_return_value = {'email': otheruser.email[0]}
        # Call the delete method
        self.testapp.delete(
            "/api/institutions/%s/hierarchy/%s/institution_children" 
            % (otherinst.key.urlsafe(), institution.key.urlsafe()),
            headers={'institution-authorization': otherinst.key.urlsafe()}
        )
        # Update the institutions
        institution = institution.key.get()
        otherinst = otherinst.key.get()
        # Assert the final conditions
        self.assertTrue(
            otherinst.key in institution.children_institutions)
        self.assertTrue(otherinst.parent_institution is None)

        message = {
            "from": {
                "photo_url": otheruser.photo_url,
                "name": otheruser.name,
                "institution_name": otherinst.name
            },
            "to": {
                "institution_name": institution.name
            },
            "current_institution": {
                "name": otherinst.name
            }
        }

        # assert the notification was sent
        send_message_notification.assert_called_with(
            receiver_key=admin.key.urlsafe(),
            notification_type="REMOVE_INSTITUTION_LINK",
            entity_key=institution.key.urlsafe(),
            message=json.dumps(message)
        )