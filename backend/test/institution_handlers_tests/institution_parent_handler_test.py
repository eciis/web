# -*- coding: utf-8 -*-
"""Institution Parent Handler Test."""

from ..test_base_handler import TestBaseHandler
from handlers import InstitutionParentHandler
from mock import patch
from .. import mocks
import json


class InstitutionParentHandlerTest(TestBaseHandler):

    @classmethod
    def setUp(cls):
        super(InstitutionParentHandlerTest, cls).setUp()
        app = cls.webapp2.WSGIApplication(
            [("/api/institutions/(.*)/hierarchy/(.*)/institution_parent", InstitutionParentHandler),
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)

    @patch('handlers.institution_parent_handler.enqueue_task')
    @patch('handlers.institution_parent_handler.NotificationsQueueManager.create_notification_task', return_value='01-938483948393')
    @patch('handlers.institution_parent_handler.send_message_notification')
    @patch('util.login_service.verify_token')
    def test_delete_child_connection(self, verify_token, send_message_notification, create_notification_task, enqueue_task):
        """Test delete method."""
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
        admin.add_institution(institution.key)
        admin.add_permission("remove_link", institution.key.urlsafe())
        admin.put()
        self.assertTrue(otherinst.key in institution.children_institutions)
        self.assertTrue(otherinst.parent_institution == institution.key)

        verify_token._mock_return_value = {'email': admin.email[0]}
        # Call the delete method
        self.testapp.delete(
            "/api/institutions/%s/hierarchy/%s/institution_parent" 
            % (institution.key.urlsafe(), otherinst.key.urlsafe()),
            headers={'institution-authorization': institution.key.urlsafe()}
        )
        # Update the institutions
        institution = institution.key.get()
        otherinst = otherinst.key.get()
        # Assert the final conditions
        self.assertTrue(
            otherinst.key not in institution.children_institutions)
        self.assertTrue(otherinst.parent_institution == institution.key)

        message = {
            "from": {
                "photo_url": admin.photo_url,
                "name": admin.name,
                "institution_name": institution.name
            },
            "to": {
                "institution_name": otherinst.name
            },
            "current_institution": {
                "name": institution.name
            }
        }

        # assert the notification was sent
        send_message_notification.assert_called_with(
            receiver_key=otheruser.key.urlsafe(),
            notification_type="REMOVE_INSTITUTION_LINK",
            entity_key=otherinst.key.urlsafe(),
            message=json.dumps(message)
        )

        enqueue_task.assert_called_with(
            'remove-admin-permissions',
            {
                'institution_key': otherinst.key.urlsafe(),
                'parent_key': institution.key.urlsafe(),
                'notification_id': '01-938483948393'
            }
        )
    
    @patch('util.login_service.verify_token')
    def test_delete_without_permission(self, verify_token):
        """Test delete without permissions."""
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
        self.assertTrue(otherinst.key in institution.children_institutions)
        self.assertTrue(otherinst.parent_institution == institution.key)

        verify_token._mock_return_value = {'email': admin.email[0]}
        # Call the delete method
        with self.assertRaises(Exception) as raises_context:
            self.testapp.delete(
                "/api/institutions/%s/hierarchy/%s/institution_parent" 
                % (otherinst.key.urlsafe(), institution.key.urlsafe()),
                headers={'institution-authorization': otherinst.key.urlsafe()}
            )
        
        exception_message = self.get_message_exception(str(raises_context.exception))

        self.assertEqual(
            exception_message, 
            'Error! User is not allowed to remove link between institutions',
            'Exception message must be equal to Error! User is not allowed to remove link between institutions'
        )
    
    @patch('util.login_service.verify_token')
    def test_delete_invalid_instution_key(self, verify_token):
        """Test delete with invalid institution key."""
        admin = mocks.create_user()
        institution = mocks.create_institution()
        institution.admin = admin.key
        institution.put()

        verify_token._mock_return_value = {'email': admin.email[0]}
        # Call the delete method
        with self.assertRaises(Exception) as raises_context:
            self.testapp.delete(
                "/api/institutions/%s/hierarchy/%s/institution_parent" 
                % (institution.key.urlsafe(), admin.key.urlsafe()),
                headers={'institution-authorization': institution.key.urlsafe()}
            )
    
        exception_message = self.get_message_exception(str(raises_context.exception))

        self.assertEqual(
            exception_message, 
            'Error! Key is not an institution',
            'Exception message must be equal to Error! Key is not an institution'
        )

        with self.assertRaises(Exception) as raises_context:
            self.testapp.delete(
                "/api/institutions/%s/hierarchy/%s/institution_parent" 
                % (admin.key.urlsafe(), institution.key.urlsafe()),
                headers={'institution-authorization': institution.key.urlsafe()}
            )

        self.assertEqual(
            exception_message, 
            'Error! Key is not an institution',
            'Exception message must be equal to Error! Key is not an institution'
        )
