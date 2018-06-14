# -*- coding: utf-8 -*-
"""Invite User Adm Handler test."""


import json
import mocks

from test_base_handler import TestBaseHandler
from google.appengine.ext import ndb
from models import InviteUserAdm
from handlers import InviteUserAdmHandler
from worker import TransferAdminPermissionsHandler
import permissions
from test_base_handler import has_permissions
from mock import patch

def add_permissions(user, institution_key, type_permission):
    user.add_permissions(type_permission, institution_key)


class InviteUserAdmHandlerTest(TestBaseHandler):
    """Invite User Adm Handler Test."""
   
    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(InviteUserAdmHandlerTest, cls).setUp()
        app = cls.webapp2.WSGIApplication(
            [("/api/invites/(.*)/institution_adm", InviteUserAdmHandler),
            ("/api/queue/transfer-admin-permissions", TransferAdminPermissionsHandler)
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)
    
    def enqueue_task(self, handler_selector, params):
        self.testapp.post('/api/queue/' + handler_selector, params)

    @patch('models.invite_user_adm.InviteUserAdm.send_notification')
    @patch('handlers.invite_user_adm_handler.enqueue_task')
    @patch('util.login_service.verify_token', return_value={'email': 'usr_test@test.com'})
    def test_put(self, verify_token, enqueue_task, send_notification):
        """Test put method  in inviteUserAdmHandler."""
        enqueue_task.side_effect = self.enqueue_task

        admin = mocks.create_user()
        new_admin = mocks.create_user()

        institution = mocks.create_institution()
        institution.add_member(admin)
        institution.set_admin(admin.key)
        institution.add_member(new_admin)

        admin.institutions.append(institution.key)
        admin.add_institution_admin(institution.key)
        add_permissions(admin, institution.key.urlsafe(), permissions.DEFAULT_ADMIN_PERMISSIONS)

        institution.put()
        admin.put()
        new_admin.put()
    
        verify_token._mock_return_value = {'email': new_admin.email[0]}
        invite = mocks.create_invite(admin, institution.key, 'USER_ADM', new_admin.key.urlsafe())

        self.assertTrue(
            has_permissions(admin, institution.key.urlsafe(),
                 permissions.DEFAULT_ADMIN_PERMISSIONS),
            'Admin must have admin permissions for this institution!'
        )
        self.assertFalse(
            has_permissions(new_admin, institution.key.urlsafe(),
                 permissions.DEFAULT_ADMIN_PERMISSIONS),
            'new_admin should not have admin permissions for this institution!'
        )
        self.assertEquals(
            admin.key, 
            institution.admin,
            'Admin must be the administrator of the institution!'
        )

        self.testapp.put('/api/invites/%s/institution_adm' %(invite.key.urlsafe()))

        institution = institution.key.get()
        admin = admin.key.get()
        new_admin = new_admin.key.get()
        invite = invite.key.get()

        self.assertFalse(
            has_permissions(admin, institution.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS),
            'Admin should not have admin permissions for this institution!'    
        )
        self.assertTrue(
            has_permissions(new_admin, institution.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS),
            'New_admin must have admin permissions for this institution!'
        )
        self.assertEquals(
            new_admin.key, 
            institution.admin,
            'New_admin must be the administrator of the institution!'
        )
        self.assertEquals(
            invite.status, 
            'accepted',
            'Invitation status must be equal to accepted!'
       )
    
    @patch('models.invite_user_adm.InviteUserAdm.send_notification')
    @patch('handlers.invite_user_adm_handler.enqueue_task')
    @patch('util.login_service.verify_token', return_value={'email': 'usr_test@test.com'})
    def test_put_invite_in_hierarchy(self, verify_token, enqueue_task, send_notification):
        """Test put invite in hierarchy."""
        enqueue_task.side_effect = self.enqueue_task

        admin = mocks.create_user()
        new_admin = mocks.create_user()
        other_admin = mocks.create_user()

        institution = mocks.create_institution()
        second_inst = mocks.create_institution()
        third_inst = mocks.create_institution()

        institution.add_member(admin)
        institution.set_admin(admin.key)
        institution.add_member(new_admin)
        institution.children_institutions = [second_inst.key]

        second_inst.add_member(other_admin)
        second_inst.set_admin(other_admin.key)
        second_inst.parent_institution = institution.key
        second_inst.children_institutions = [third_inst.key]

        third_inst.add_member(admin)
        third_inst.set_admin(admin.key)
        third_inst.parent_institution = second_inst.key

        admin.institutions.append(institution.key)
        admin.institutions.append(third_inst.key)
        admin.add_institution_admin(institution.key)
        admin.add_institution_admin(third_inst.key)
        other_admin.institutions.append(second_inst.key)
        other_admin.add_institution_admin(second_inst.key)
        add_permissions(admin, institution.key.urlsafe(),
             permissions.DEFAULT_ADMIN_PERMISSIONS)
        add_permissions(admin, second_inst.key.urlsafe(),
             permissions.DEFAULT_ADMIN_PERMISSIONS)
        add_permissions(admin, third_inst.key.urlsafe(),
             permissions.DEFAULT_ADMIN_PERMISSIONS)
        add_permissions(other_admin, second_inst.key.urlsafe(),
             permissions.DEFAULT_ADMIN_PERMISSIONS)

        institution.put()
        second_inst.put()
        third_inst.put()
        admin.put()
        new_admin.put()
        other_admin.put()
    
        verify_token._mock_return_value = {'email': new_admin.email[0]}
        invite = mocks.create_invite(admin, institution.key, 'USER_ADM', new_admin.key.urlsafe())

        self.assertTrue(
            has_permissions(admin, institution.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS),
            'Admin must have user permissions for this institution!'
        )
        self.assertTrue(
            has_permissions(admin, second_inst.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS),
            'Admin must have user permissions for second_inst institution!'
        )
        self.assertTrue(
            has_permissions(admin, third_inst.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS),
            'Admin must have user permissions for third_inst institution!'
        )
        self.assertTrue(
            has_permissions(other_admin, second_inst.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS),
            'other_admin must have user permissions for second_inst institution!'    
        )
        self.assertFalse(
            has_permissions(new_admin, institution.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS),
            'new_admin should not have user permissions for this institution!'
        )
        self.assertFalse(
            has_permissions(new_admin, second_inst.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS),
            'new_admin should not have user permissions for the second_inst institution!'
        )
        self.assertFalse(
            has_permissions(new_admin, third_inst.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS),
            'new_admin should not have user permissions for the third_inst institution!'
        )
        self.assertEquals(
            admin.key, 
            institution.admin,
            'Admin must be the administrator of the institution!'
        )

        self.testapp.put('/api/invites/%s/institution_adm' %(invite.key.urlsafe()))

        institution = institution.key.get()
        second_inst = second_inst.key.get()
        third_inst = third_inst.key.get()
        admin = admin.key.get()
        new_admin = new_admin.key.get()
        other_admin.key.get()
        invite = invite.key.get()

        self.assertFalse(
            has_permissions(admin, institution.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS),
            'admin should not have admin permissions for this institution!'
        )
        self.assertFalse(
            has_permissions(admin, second_inst.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS),
            'admin should not have admin permissions for the third_inst institution!'
        )
        self.assertTrue(
            has_permissions(admin, third_inst.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS),
            'Admin must have admin permissions for third_inst institution!'    
        )
        self.assertTrue(
            has_permissions(other_admin, second_inst.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS),
            'other_admin must have admin permissions for second_inst institution!'
        )
        self.assertTrue(
            has_permissions(new_admin, institution.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS),
            'new_admin must have admin permissions for this institution!'
        )
        self.assertTrue(
            has_permissions(new_admin, second_inst.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS),
            'New_admin must have admin permissions for second_inst institution!'
        )
        self.assertTrue(
            has_permissions(new_admin, third_inst.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS),
            'New_admin must have admin permissions for third_inst institution!'
        )
        self.assertEquals(
            new_admin.key, 
            institution.admin,
            'New_admin must be the administrator of the institution!'
        )
    
    @patch('models.invite_user_adm.InviteUserAdm.send_notification')
    @patch('handlers.invite_user_adm_handler.enqueue_task')
    @patch('util.login_service.verify_token', return_value={'email': 'usr_test@test.com'})
    def test_put_invite_with_user_admin_of_parent_inst(self, verify_token, enqueue_task, send_notification):
        """Test put invite with user is admin of parent institution."""
        enqueue_task.side_effect = self.enqueue_task

        admin = mocks.create_user()
        new_admin = mocks.create_user()
        other_admin = mocks.create_user()

        institution = mocks.create_institution()
        second_inst = mocks.create_institution()
        third_inst = mocks.create_institution()

        institution.add_member(admin)
        institution.set_admin(admin.key)
        institution.children_institutions = [second_inst.key]

        second_inst.add_member(other_admin)
        second_inst.set_admin(other_admin.key)
        second_inst.parent_institution = institution.key
        second_inst.children_institutions = [third_inst.key]

        third_inst.add_member(admin)
        third_inst.set_admin(admin.key)
        third_inst.add_member(new_admin)
        third_inst.parent_institution = second_inst.key

        admin.institutions.append(institution.key)
        admin.institutions.append(third_inst.key)
        admin.add_institution_admin(institution.key)
        admin.add_institution_admin(third_inst.key)
        other_admin.institutions.append(second_inst.key)
        other_admin.add_institution_admin(second_inst.key)
        add_permissions(admin, institution.key.urlsafe(), 
            permissions.DEFAULT_ADMIN_PERMISSIONS)
        add_permissions(admin, second_inst.key.urlsafe(),
            permissions.DEFAULT_ADMIN_PERMISSIONS)
        add_permissions(admin, third_inst.key.urlsafe(),
            permissions.DEFAULT_ADMIN_PERMISSIONS)
        add_permissions(other_admin, second_inst.key.urlsafe(),
            permissions.DEFAULT_ADMIN_PERMISSIONS)

        institution.put()
        second_inst.put()
        third_inst.put()
        admin.put()
        new_admin.put()
        other_admin.put()
    
        verify_token._mock_return_value = {'email': new_admin.email[0]}
        invite = mocks.create_invite(admin, third_inst.key, 'USER_ADM', new_admin.key.urlsafe())

        self.assertTrue(
            has_permissions(admin, institution.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS),
            'Admin must have admin permissions for this institution!'
        )
        self.assertTrue(
            has_permissions(admin, second_inst.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS),
            'Admin must have admin permissions for second_inst institution!'
        )
        self.assertTrue(
            has_permissions(admin, third_inst.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS),
            'Admin must have admin permissions for third_inst institution!'
        )
        self.assertTrue(
            has_permissions(other_admin, second_inst.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS),
            'other_admin must have admin permissions for second_inst institution!'    
        )
        self.assertFalse(
            has_permissions(new_admin, institution.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS),
            'new_admin should not have admin permissions for this institution!'
        )
        self.assertFalse(
            has_permissions(new_admin, second_inst.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS),
            'new_admin should not have admin permissions for the second_inst institution!'
        )
        self.assertFalse(
            has_permissions(new_admin, third_inst.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS),
            'new_admin should not have admin permissions for the third_inst institution!'
        )
        self.assertEquals(
            admin.key, 
            third_inst.admin,
            'Admin must be the administrator of the institution!'
        )

        self.testapp.put('/api/invites/%s/institution_adm' %(invite.key.urlsafe()))

        institution = institution.key.get()
        second_inst = second_inst.key.get()
        third_inst = third_inst.key.get()
        admin = admin.key.get()
        new_admin = new_admin.key.get()
        other_admin.key.get()
        invite = invite.key.get()

        self.assertTrue(
            has_permissions(admin, institution.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS),
            'admin must have admin permissions for this institution!'
        )
        self.assertTrue(
            has_permissions(admin, second_inst.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS),
            'Admin must have admin permissions for second_inst institution!'
        )
        self.assertTrue(
            has_permissions(admin, third_inst.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS),
            'Admin must have admin permissions for third_inst institution!'    
        )
        self.assertTrue(
            has_permissions(other_admin, second_inst.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS),
            'other_admin must have admin permissions for second_inst institution!'
        )
        self.assertFalse(
            has_permissions(new_admin, institution.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS),
            'new_admin should not have admin permissions for this institution!'
        )
        self.assertFalse(
            has_permissions(new_admin, second_inst.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS),
            'new_admin should not have admin permissions for the second_inst institution!'
        )
        self.assertTrue(
            has_permissions(new_admin, third_inst.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS),
            'New_admin must have admin permissions for third_inst institution!'
        )
        self.assertEquals(
            new_admin.key, 
            third_inst.admin,
            'New_admin must be the administrator of the institution!'
        )

    @patch('models.invite_user_adm.InviteUserAdm.send_notification')
    @patch('handlers.invite_user_adm_handler.enqueue_task')
    @patch('util.login_service.verify_token', return_value={'email': 'usr_test@test.com'})
    def test_put_invite_with_super_user_admin_of_parent_inst(self, verify_token, enqueue_task, send_notification):
        """Test put invite with user super user and is admin of parent institution."""
        enqueue_task.side_effect = self.enqueue_task

        admin = mocks.create_user()
        new_admin = mocks.create_user()

        institution = mocks.create_institution()
        second_inst = mocks.create_institution()
        second_inst.name = "Departamento do Complexo Industrial e Inovacao em Saude"
        second_inst.trusted = True
        third_inst = mocks.create_institution()

        institution.add_member(admin)
        institution.set_admin(admin.key)
        institution.children_institutions = [second_inst.key]

        # Departamento do Complexo Industrial e Inovacao em Saude
        # Admin of this institution is Super User
        second_inst.add_member(admin)
        second_inst.set_admin(admin.key)
        second_inst.add_member(new_admin)
        second_inst.parent_institution = institution.key
        second_inst.children_institutions = [third_inst.key]

        third_inst.add_member(admin)
        third_inst.set_admin(admin.key)
        third_inst.add_member(new_admin)
        third_inst.parent_institution = second_inst.key

        admin.institutions.append(institution.key)
        admin.institutions.append(second_inst.key)
        admin.institutions.append(third_inst.key)
        admin.add_institution_admin(institution.key)
        admin.add_institution_admin(second_inst.key)
        admin.add_institution_admin(third_inst.key)
        add_permissions(admin, institution.key.urlsafe(),
            permissions.DEFAULT_ADMIN_PERMISSIONS)
        add_permissions(admin, second_inst.key.urlsafe(),
            permissions.DEFAULT_ADMIN_PERMISSIONS)
        add_permissions(admin, second_inst.key.urlsafe(),
            permissions.DEFAULT_SUPER_USER_PERMISSIONS)
        add_permissions(admin, third_inst.key.urlsafe(),
            permissions.DEFAULT_ADMIN_PERMISSIONS)

        institution.put()
        second_inst.put()
        third_inst.put()
        admin.put()
        new_admin.put()
    
        verify_token._mock_return_value = {'email': new_admin.email[0]}
        invite = mocks.create_invite(admin, second_inst.key, 'USER_ADM', new_admin.key.urlsafe())

        self.assertTrue(
            has_permissions(admin, institution.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS),
            'Admin must have admin permissions for this institution!'
        )
        self.assertTrue(
            has_permissions(admin, second_inst.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS),
            'Admin must have admin user permissions for second_inst institution!'
        )
        self.assertTrue(
            has_permissions(admin, second_inst.key.urlsafe(),
                permissions.DEFAULT_SUPER_USER_PERMISSIONS),
            'Admin must have super user permissions for second_inst institution!'
        )
        self.assertTrue(
            has_permissions(admin, third_inst.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS),
            'Admin must have admin user permissions for third_inst institution!'
        )
        self.assertFalse(
            has_permissions(new_admin, institution.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS),
            'Admin must have not admin permissions for this institution!'
        )
        self.assertFalse(
            has_permissions(new_admin, second_inst.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS),
            'Admin must have not admin user permissions for second_inst institution!'
        )
        self.assertFalse(
            has_permissions(new_admin, second_inst.key.urlsafe(),
                permissions.DEFAULT_SUPER_USER_PERMISSIONS),
            'Admin must have not super user permissions for second_inst institution!'
        )
        self.assertFalse(
            has_permissions(new_admin, third_inst.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS),
            'Admin must have not admin user permissions for third_inst institution!'
        )

        self.testapp.put('/api/invites/%s/institution_adm' %(invite.key.urlsafe()))

        institution = institution.key.get()
        second_inst = second_inst.key.get()
        third_inst = third_inst.key.get()
        admin = admin.key.get()
        new_admin = new_admin.key.get()
        invite = invite.key.get()

        self.assertTrue(
            has_permissions(admin, institution.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS),
            'admin must have admin permissions for this institution!'
        )
        self.assertTrue(
            has_permissions(admin, second_inst.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS),
            'Admin must have admin permissions for second_inst institution!'
        )
        self.assertFalse(
            has_permissions(admin, second_inst.key.urlsafe(),
                permissions.DEFAULT_SUPER_USER_PERMISSIONS),
            "Admin shouldn't have admin permissions for second_inst institution!"
        )
        self.assertTrue(
            has_permissions(admin, third_inst.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS),
            'Admin must have admin permissions for third_inst institution!'    
        )
        self.assertTrue(
            has_permissions(new_admin, second_inst.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS),
            'new_admin must have admin user permissions for second_inst institution!'
        )
        self.assertTrue(
            has_permissions(new_admin, second_inst.key.urlsafe(),
                permissions.DEFAULT_SUPER_USER_PERMISSIONS),
            'new_admin must have super user permissions for second_inst institution!'
        )
        self.assertFalse(
            has_permissions(new_admin, institution.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS),
            'new_admin should not have admin permissions for this institution!'
        )
        self.assertTrue(
            has_permissions(new_admin, third_inst.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS),
            'New_admin must have admin user permissions for third_inst institution!'
        )
    
    @patch('models.invite_user_adm.InviteUserAdm.send_notification')
    @patch('handlers.invite_user_adm_handler.enqueue_task')
    @patch('util.login_service.verify_token', return_value={'email': 'usr_test@test.com'})
    def test_put_invite_super_user(self, verify_token, enqueue_task, send_notification):
        """Test put invite with user is super admin."""
        enqueue_task.side_effect = self.enqueue_task

        admin = mocks.create_user()
        new_admin = mocks.create_user()

        institution = mocks.create_institution()
        institution.name = "Departamento do Complexo Industrial e Inovacao em Saude"
        institution.trusted = True
        institution.add_member(admin)
        institution.set_admin(admin.key)
        institution.add_member(new_admin)

        new_admin.institutions.append(institution.key)
        admin.institutions.append(institution.key)
        admin.add_institution_admin(institution.key)
        
        add_permissions(admin, institution.key.urlsafe(),
            permissions.DEFAULT_ADMIN_PERMISSIONS)
        add_permissions(admin, institution.key.urlsafe(),
            permissions.DEFAULT_SUPER_USER_PERMISSIONS)

        institution.put()
        admin.put()
        new_admin.put()
    
        verify_token._mock_return_value = {'email': new_admin.email[0]}
        invite = mocks.create_invite(admin, institution.key, 'USER_ADM', new_admin.key.urlsafe())

        self.assertTrue(
            has_permissions(admin, institution.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS),
            'Admin must have administrative permissions!'
        )
        self.assertTrue(
            has_permissions(admin, institution.key.urlsafe(),
                permissions.DEFAULT_SUPER_USER_PERMISSIONS),
            'Admin must have super user permissions for this institution!'
        )    
        self.assertFalse(
            has_permissions(new_admin, institution.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS),
            'new_admin should not have administrative permissions for this institution!'
        )
        self.assertFalse(
            has_permissions(new_admin, institution.key.urlsafe(),
                permissions.DEFAULT_SUPER_USER_PERMISSIONS),
            'new_admin should not have super user permissions for this institution!'
        )   

        self.testapp.put('/api/invites/%s/institution_adm' %(invite.key.urlsafe()))

        institution = institution.key.get()
        admin = admin.key.get()
        new_admin = new_admin.key.get()
        invite = invite.key.get()

        self.assertFalse(
            has_permissions(admin, institution.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS),
            'admin must have super not user permissions for this institution!'
        )
        self.assertFalse(
            has_permissions(admin, institution.key.urlsafe(),
                permissions.DEFAULT_SUPER_USER_PERMISSIONS),
            'admin must have not super user permissions for this institution!'
        )
        self.assertTrue(
            has_permissions(new_admin, institution.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS),
            'new_admin must have admin permissions for second_inst institution!'
        )
        self.assertTrue(
            has_permissions(new_admin, institution.key.urlsafe(),
                permissions.DEFAULT_SUPER_USER_PERMISSIONS),
            'new_admin must have super user permissions for second_inst institution!'
        )

    @patch('util.login_service.verify_token', return_value={'email': 'usr_test@test.com'})
    def test_put_accepted_and_rejected_invite(self, verify_token):
        """Test put accepted and rejected invite."""
        admin = mocks.create_user()
        new_admin = mocks.create_user()

        institution = mocks.create_institution()
        institution.add_member(admin)
        institution.set_admin(admin.key)
        institution.add_member(new_admin)

        admin.institutions.append(institution.key)
        admin.add_institution_admin(institution.key)
        add_permissions(admin, institution.key.urlsafe(),
            permissions.DEFAULT_ADMIN_PERMISSIONS)

        institution.put()
        admin.put()
        new_admin.put()
    
        invite = mocks.create_invite(admin, institution.key, 'USER_ADM', new_admin.key.urlsafe())
        invite.change_status('accepted')

        self.assertTrue(
            has_permissions(admin, institution.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS),
            'Admin must have admin permissions for this institution!'
        )
        self.assertFalse(
            has_permissions(new_admin, institution.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS),
            'New_admin should not have admin permissions for this institution!'
        )
        self.assertEquals(
            admin.key, 
            institution.admin,
            'Admin must be the administrator of the institution!'
        )

        with self.assertRaises(Exception) as raises_context:
            self.testapp.put('/api/invites/%s/institution_adm' %(invite.key.urlsafe()))
        
        institution = institution.key.get()
        admin = admin.key.get()
        new_admin = new_admin.key.get()

        self.assertTrue(
            has_permissions(admin, institution.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS),
            'Admin must have admin permissions for this institution!'
        )
        self.assertFalse(
            has_permissions(new_admin, institution.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS),
            'New_admin should not have admin permissions for this institution!'
        )
        self.assertEquals(
            admin.key, 
            institution.admin,
            'Admin must be the administrator of the institution!'
        )
        self.assertEquals(
            invite.status, 
            'accepted',
            'Invitation status must be equal to accepted!'
        )

        message_exception = self.get_message_exception(str(raises_context.exception))
        self.assertEqual(
            message_exception, 
            'Error! This invitation has already been processed',
            'Expected message of exception must be equal to Error! This invitation has already been processed'
        )

        invite.change_status('rejected')

        with self.assertRaises(Exception) as raises_context:
            self.testapp.put('/api/invites/%s/institution_adm' %(invite.key.urlsafe()))
        
        institution = institution.key.get()
        admin = admin.key.get()
        new_admin = new_admin.key.get()
        invite = invite.key.get()

        self.assertTrue(
            has_permissions(admin, institution.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS),
            'Admin must have admin permissions for this institution!'
        )
        self.assertFalse(
            has_permissions(new_admin, institution.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS),
            'New_admin should not have admin permissions for this institution!'
        )
        self.assertEquals(
            admin.key, 
            institution.admin,
            'Admin must be the administrator of the institution!'
        )
        self.assertEquals(
            invite.status, 
            'rejected',
            'Invitation status must be equal to rejected!'
        )

        message_exception = self.get_message_exception(str(raises_context.exception))
        self.assertEqual(
            message_exception, 
            'Error! This invitation has already been processed',
            'Expected message of exception must be equal to Error! This invitation has already been processed'
        )

    @patch('util.login_service.verify_token', return_value={'email': 'usr_test@test.com'})
    def test_put_invite_not_allowed(self, verify_token):
        """Test put invite not allowed."""
        admin = mocks.create_user()
        new_admin = mocks.create_user()

        institution = mocks.create_institution()
        institution.add_member(admin)
        institution.set_admin(admin.key)
        institution.add_member(new_admin)

        admin.institutions.append(institution.key)
        admin.add_institution_admin(institution.key)
        add_permissions(admin, institution.key.urlsafe(),
            permissions.DEFAULT_ADMIN_PERMISSIONS)

        institution.put()
        admin.put()
        new_admin.put()
    
        invite = mocks.create_invite(admin, institution.key, 'USER')

        self.assertTrue(
            has_permissions(admin, institution.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS),
            'Admin must have admin permissions for this institution!'
        )
        self.assertFalse(
            has_permissions(new_admin, institution.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS),
            'New_admin should not have admin permissions for this institution!'    
        )
        self.assertEquals(
            admin.key, 
            institution.admin,
            'Admin must be the administrator of the institution!'
        )

        with self.assertRaises(Exception) as raises_context:
            self.testapp.put('/api/invites/%s/institution_adm' %(invite.key.urlsafe()))
        
        institution = institution.key.get()
        admin = admin.key.get()
        new_admin = new_admin.key.get()
        invite = invite.key.get()

        self.assertTrue(
            has_permissions(admin, institution.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS), 
            'Admin must have admin permissions for this institution!'
        )
        self.assertFalse(
            has_permissions(new_admin, institution.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS),
            'New_admin should not have admin permissions for this institution!'
        )
        self.assertEquals(
            admin.key, 
            institution.admin,
            'Admin must be the administrator of the institution!'
        )
        self.assertEquals(
            invite.status, 
            'sent',
            'Invitation status must be equal to sent!'
        )

        message_exception = self.get_message_exception(str(raises_context.exception))
        self.assertEqual(
            message_exception, 
            'Error! Invitation type not allowed',
            'Expected message of exception must be equal to Error! Invitation type not allowed'
        )

    @patch('models.invite_user_adm.InviteUserAdm.send_notification')
    @patch('util.login_service.verify_token', return_value={'email': 'usr_test@test.com'})
    def test_delete(self, verify_token, send_notification):
        """Test reject invite."""
        admin = mocks.create_user()
        new_admin = mocks.create_user()

        institution = mocks.create_institution()
        institution.add_member(admin)
        institution.set_admin(admin.key)
        institution.add_member(new_admin)

        admin.institutions.append(institution.key)
        admin.add_institution_admin(institution.key)
        add_permissions(admin, institution.key.urlsafe(),
            permissions.DEFAULT_ADMIN_PERMISSIONS)

        institution.put()
        admin.put()
        new_admin.put()
    
        invite = mocks.create_invite(admin, institution.key, 'USER_ADM', new_admin.key.urlsafe())
        self.assertTrue(
            has_permissions(admin, institution.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS), 
            'Admin must have admin permissions for this institution!'
        )
        self.assertFalse(
            has_permissions(new_admin, institution.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS),
            'New_admin should not have admin permissions for this institution!'
        )
        self.assertEquals(
            admin.key, 
            institution.admin,
            'Admin must be the administrator of the institution!'
        )

        self.testapp.delete('/api/invites/%s/institution_adm' %(invite.key.urlsafe()))
        
        institution = institution.key.get()
        admin = admin.key.get()
        new_admin = new_admin.key.get()
        invite = invite.key.get()

        self.assertTrue(
            has_permissions(admin, institution.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS),
            'Admin must have admin permissions for this institution!'
        )
        self.assertFalse(
            has_permissions(new_admin, institution.key.urlsafe(),
                permissions.DEFAULT_ADMIN_PERMISSIONS),
            'New_admin should not have admin permissions for this institution!'
        )
        self.assertEquals(
            admin.key, 
            institution.admin,
            'Admin must be the administrator of the institution!'
        )
        self.assertEquals(
            invite.status, 
            'rejected',
            'Invitation status must be equal to rejected!'
        )
