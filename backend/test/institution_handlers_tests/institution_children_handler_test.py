# -*- coding: utf-8 -*-
"""Institution Children handler test."""

from ..test_base_handler import TestBaseHandler
from handlers import InstitutionChildrenHandler
from mock import patch
from .. import mocks
import json


class InstitutionChildrenHandlerTest(TestBaseHandler):

    @classmethod
    def setUp(cls):
        super(InstitutionChildrenHandlerTest, cls).setUp()
        app = cls.webapp2.WSGIApplication(
            [("/api/institutions/(.*)/hierarchy/(.*)/institution_children", InstitutionChildrenHandler),
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)
    
    @patch('handlers.institution_children_handler.NotificationsQueueManager.create_notification_task', return_value='00-21879638')
    @patch('util.login_service.verify_token')
    @patch('handlers.institution_children_handler.enqueue_task')
    def test_delete_parent_connection(self, enqueue_task, verify_token, create_notification_task):
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

        create_notification_task.assert_called()
        enqueue_task.assert_called_with(
            'remove-admin-permissions', 
            {
                'institution_key': otherinst.key.urlsafe(), 
                'parent_key': institution.key.urlsafe(),
                'notification_id': '00-21879638'
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

        verify_token._mock_return_value = {'email': otheruser.email[0]}
        # Call the delete method
        with self.assertRaises(Exception) as raises_context:
            self.testapp.delete(
                "/api/institutions/%s/hierarchy/%s/institution_children" 
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
        otheruser = mocks.create_user()
        otherinst = mocks.create_institution()
        otherinst.admin = otheruser.key
        otherinst.put()
        otheruser.add_institution(otherinst.key)
        otheruser.add_permission("remove_link", otherinst.key.urlsafe())

        verify_token._mock_return_value = {'email': otheruser.email[0]}
        # Call the delete method
        with self.assertRaises(Exception) as raises_context:
            self.testapp.delete(
                "/api/institutions/%s/hierarchy/%s/institution_children" 
                % (otherinst.key.urlsafe(), otheruser.key.urlsafe()),
                headers={'institution-authorization': otherinst.key.urlsafe()}
            )
    
        exception_message = self.get_message_exception(str(raises_context.exception))

        self.assertEqual(
            exception_message, 
            'Error! Key is not an institution',
            'Exception message must be equal to Error! Key is not an institution'
        )

        with self.assertRaises(Exception) as raises_context:
            self.testapp.delete(
                "/api/institutions/%s/hierarchy/%s/institution_children" 
                % (otheruser.key.urlsafe(), otherinst.key.urlsafe()),
                headers={'institution-authorization': otherinst.key.urlsafe()}
            )

        self.assertEqual(
            exception_message, 
            'Error! Key is not an institution',
            'Exception message must be equal to Error! Key is not an institution'
        )
