# -*- coding: utf-8 -*-
"""Institution hierarchy handler test."""

from test_base_handler import TestBaseHandler
from handlers.institution_hierarchy_handler import InstitutionHierarchyHandler
from worker import AddAdminPermissionsInInstitutionHierarchy
from worker import RemoveAdminPermissionsInInstitutionHierarchy
from mock import patch
import mocks
import permissions
import json
from test_base_handler import has_permissions

ADMIN = {'email': 'user1@gmail.com'}
USER = {'email': 'otheruser@ccc.ufcg.edu.br'}

class InstitutionHierarchyHandlerTest(TestBaseHandler):
    """Test Institution Hierarchie Handler class."""

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(InstitutionHierarchyHandlerTest, cls).setUp()
        methods = set(cls.webapp2.WSGIApplication.allowed_methods)
        methods.add('PATCH')
        cls.webapp2.WSGIApplication.allowed_methods = frozenset(methods)
        app = cls.webapp2.WSGIApplication(
            [("/api/institutions/(.*)/hierarchy/(.*)", InstitutionHierarchyHandler),
            ("/api/queue/add-admin-permissions", AddAdminPermissionsInInstitutionHierarchy),
            ('/api/queue/remove-admin-permissions', RemoveAdminPermissionsInInstitutionHierarchy)
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)
    
    def enqueue_task(self, handler_selector, params):
        """Method of mock enqueue tasks."""
        if handler_selector == 'add-admin-permissions' or handler_selector == 'remove-admin-permissions':
            self.testapp.post('/api/queue/' + handler_selector, params=params)

    @patch('handlers.institution_hierarchy_handler.send_message_notification')
    @patch('utils.verify_token', return_value=ADMIN)
    def test_delete_child_connection(self, verify_token, send_message_notification):
        """Test delete method with isParent=false."""
        # Assert the initial conditions
        admin = mocks.create_user(ADMIN['email'])
        otheruser = mocks.create_user(USER['email'])
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
        # Call the delete method
        self.testapp.delete(
            "/api/institutions/%s/hierarchy/%s?isParent=false" 
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
            notification_type="INSTITUTION",
            entity_key=otherinst.key.urlsafe(),
            message=json.dumps(message)
        )

    @patch('handlers.institution_hierarchy_handler.send_message_notification')
    @patch('utils.verify_token', return_value=USER)
    def test_delete_parent_connection(self, verify_token, send_message_notification):
        """Test delete method with isParent=true."""
        # Assert the initial conditions
        admin = mocks.create_user(ADMIN['email'])
        otheruser = mocks.create_user(USER['email'])
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
        # Call the delete method
        self.testapp.delete(
            "/api/institutions/%s/hierarchy/%s?isParent=true" 
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
            notification_type="INSTITUTION",
            entity_key=institution.key.urlsafe(),
            message=json.dumps(message)
        )

    @patch('handlers.institution_hierarchy_handler.enqueue_task')
    @patch('utils.verify_token', return_value={'email': 'user@example.com'})
    def test_remove_admin_permission_in_institution_hierarchy(self, verify_token, enqueue_task):
        """Test remove admin permissions in institution hierarchy."""
        second_user = mocks.create_user()
        third_user = mocks.create_user()

        second_inst = mocks.create_institution()
        third_inst = mocks.create_institution()

        second_inst.admin = second_user.key
        third_inst.admin = third_user.key

        second_user.institutions_admin.append(second_inst.key)
        third_user.institutions_admin.append(third_inst.key)

        third_inst.parent_institution = second_inst.key

        second_inst.children_institutions.append(third_inst.key)

        third_user.add_permission('remove_link', third_inst.key.urlsafe())
        second_user.add_permissions(permissions.DEFAULT_ADMIN_PERMISSIONS, third_inst.key.urlsafe())
       
        second_inst.put()
        third_inst.put()

        second_user.put()
        third_user.put()

        self.assertTrue(has_permissions(
            second_user, third_inst.key.urlsafe(), permissions.DEFAULT_ADMIN_PERMISSIONS))

        enqueue_task.side_effect = self.enqueue_task
        verify_token._mock_return_value = {'email': third_user.email[0]}

        self.testapp.delete("/api/institutions/%s/hierarchy/%s?isParent=true" %
            (third_inst.key.urlsafe(), second_inst.key.urlsafe()))
        
        second_user = second_user.key.get()
        
        self.assertFalse(has_permissions(
            second_user, third_inst.key.urlsafe(), permissions.DEFAULT_ADMIN_PERMISSIONS))

    def tearDown(cls):
        """Deactivate the test."""
        cls.test.deactivate()
