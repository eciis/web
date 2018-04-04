# -*- coding: utf-8 -*-
"""Invite User Adm Handler test."""


import json
import mocks

from test_base_handler import TestBaseHandler
from google.appengine.ext import ndb
from models.invite_user_adm import InviteUserAdm
from handlers.invite_user_adm_handler import InviteUserAdmHandler
from worker import TransferAdminPermissionsHandler
import permissions

from mock import patch

def add_admin_permission(user, institution_key):
    user.add_permissions(permissions.DEFAULT_ADMIN_PERMISSIONS, institution_key)

def add_super_user_permission(user, institution_key):
    user.add_permissions(permissions.DEFAULT_SUPER_USER_PERMISSIONS, institution_key)

def has_admin_permissions(user, institution_key):
    for permission in permissions.DEFAULT_ADMIN_PERMISSIONS:
        if not user.has_permission(permission, institution_key):
            return False
    return True

def has_super_user_permissions(user, institution_key):
    for permission in permissions.DEFAULT_SUPER_USER_PERMISSIONS:
        if not user.has_permission(permission, institution_key):
            return False
    return True

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
    @patch('utils.verify_token', return_value={'email': 'usr_test@test.com'})
    def test_put(self, verify_token, enqueue_task, send_notification):
        """Test put method  in inviteUserAdmHandler."""
        enqueue_task.side_effect = self.enqueue_task

        admin = mocks.create_user()
        new_admin = mocks.create_user()

        institution = mocks.create_institution()
        institution.set_admin(admin.key)
        institution.add_member(admin)
        institution.add_member(new_admin)

        admin.add_institution_admin(institution.key)
        add_admin_permission(admin, institution.key.urlsafe())

        institution.put()
        admin.put()
        new_admin.put()
    
        verify_token._mock_return_value = {'email': new_admin.email[0]}
        invite = mocks.create_invite(admin, institution.key, 'USER_ADM', new_admin.key.urlsafe())

        self.assertTrue(
            has_admin_permissions(admin, institution.key.urlsafe()),
            'Admin must have super user permissions for this institution!'
        )
        self.assertFalse(
            has_admin_permissions(new_admin, institution.key.urlsafe()),
            'new_admin should not have super user permissions for this institution!'
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
            has_admin_permissions(admin, institution.key.urlsafe()),
            'Admin should not have super user permissions for this institution!'    
        )
        self.assertTrue(
            has_admin_permissions(new_admin, institution.key.urlsafe()),
            'New_admin must have super user permissions for this institution!'
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
    @patch('utils.verify_token', return_value={'email': 'usr_test@test.com'})
    def test_put_invite_in_hierarchy(self, verify_token, enqueue_task, send_notification):
        """Test put invite in hierarchy."""
        enqueue_task.side_effect = self.enqueue_task

        admin = mocks.create_user()
        new_admin = mocks.create_user()
        other_admin = mocks.create_user()

        institution = mocks.create_institution()
        second_inst = mocks.create_institution()
        third_inst = mocks.create_institution()

        institution.set_admin(admin.key)
        institution.add_member(admin)
        institution.add_member(new_admin)
        institution.children_institutions = [second_inst.key]

        second_inst.set_admin(other_admin.key)
        second_inst.add_member(other_admin)
        second_inst.parent_institution = institution.key
        second_inst.children_institutions = [third_inst.key]

        third_inst.set_admin(admin.key)
        third_inst.add_member(admin)
        third_inst.parent_institution = second_inst.key

        admin.add_institution_admin(institution.key)
        admin.add_institution_admin(third_inst.key)
        other_admin.add_institution_admin(second_inst.key)
        add_admin_permission(admin, institution.key.urlsafe())
        add_admin_permission(admin, second_inst.key.urlsafe())
        add_admin_permission(admin, third_inst.key.urlsafe())
        add_admin_permission(other_admin, second_inst.key.urlsafe())

        institution.put()
        second_inst.put()
        third_inst.put()
        admin.put()
        new_admin.put()
        other_admin.put()
    
        verify_token._mock_return_value = {'email': new_admin.email[0]}
        invite = mocks.create_invite(admin, institution.key, 'USER_ADM', new_admin.key.urlsafe())

        self.assertTrue(
            has_admin_permissions(admin, institution.key.urlsafe()),
            'Admin must have super user permissions for this institution!'
        )
        self.assertTrue(
            has_admin_permissions(admin, second_inst.key.urlsafe()),
            'Admin must have super user permissions for second_inst institution!'
        )
        self.assertTrue(
            has_admin_permissions(admin, third_inst.key.urlsafe()),
            'Admin must have super user permissions for third_inst institution!'
        )
        self.assertTrue(
            has_admin_permissions(other_admin, second_inst.key.urlsafe()),
            'other_admin must have super user permissions for second_inst institution!'    
        )
        self.assertFalse(
            has_admin_permissions(new_admin, institution.key.urlsafe()),
            'new_admin should not have super user permissions for this institution!'
        )
        self.assertFalse(
            has_admin_permissions(new_admin, second_inst.key.urlsafe()),
            'new_admin should not have super user permissions for the second_inst institution!'
        )
        self.assertFalse(
            has_admin_permissions(new_admin, third_inst.key.urlsafe()),
            'new_admin should not have super user permissions for the third_inst institution!'
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
            has_admin_permissions(admin, institution.key.urlsafe()),
            'admin should not have super user permissions for this institution!'
        )
        self.assertFalse(
            has_admin_permissions(admin, second_inst.key.urlsafe()),
            'admin should not have super user permissions for the third_inst institution!'
        )
        self.assertTrue(
            has_admin_permissions(admin, third_inst.key.urlsafe()),
            'Admin must have super user permissions for third_inst institution!'    
        )
        self.assertTrue(
            has_admin_permissions(other_admin, second_inst.key.urlsafe()),
            'other_admin must have super user permissions for second_inst institution!'
        )
        self.assertTrue(
            has_admin_permissions(new_admin, institution.key.urlsafe()),
            'new_admin must have super user permissions for this institution!'
        )
        self.assertTrue(
            has_admin_permissions(new_admin, second_inst.key.urlsafe()),
            'New_admin must have super user permissions for second_inst institution!'
        )
        self.assertTrue(
            has_admin_permissions(new_admin, third_inst.key.urlsafe()),
            'New_admin must have super user permissions for third_inst institution!'
        )
        self.assertEquals(
            new_admin.key, 
            institution.admin,
            'New_admin must be the administrator of the institution!'
        )
    
    @patch('models.invite_user_adm.InviteUserAdm.send_notification')
    @patch('handlers.invite_user_adm_handler.enqueue_task')
    @patch('utils.verify_token', return_value={'email': 'usr_test@test.com'})
    def test_put_invite_with_user_admin_of_parent_inst(self, verify_token, enqueue_task, send_notification):
        """Test put invite with user is admin of parent institution."""
        enqueue_task.side_effect = self.enqueue_task

        admin = mocks.create_user()
        new_admin = mocks.create_user()
        other_admin = mocks.create_user()

        institution = mocks.create_institution()
        second_inst = mocks.create_institution()
        third_inst = mocks.create_institution()

        institution.set_admin(admin.key)
        institution.add_member(admin)
        institution.children_institutions = [second_inst.key]

        second_inst.set_admin(other_admin.key)
        second_inst.add_member(other_admin)
        second_inst.parent_institution = institution.key
        second_inst.children_institutions = [third_inst.key]

        third_inst.set_admin(admin.key)
        third_inst.add_member(admin)
        third_inst.add_member(new_admin)
        third_inst.parent_institution = second_inst.key

        admin.add_institution_admin(institution.key)
        admin.add_institution_admin(third_inst.key)
        other_admin.add_institution_admin(second_inst.key)
        add_admin_permission(admin, institution.key.urlsafe())
        add_admin_permission(admin, second_inst.key.urlsafe())
        add_admin_permission(admin, third_inst.key.urlsafe())
        add_admin_permission(other_admin, second_inst.key.urlsafe())

        institution.put()
        second_inst.put()
        third_inst.put()
        admin.put()
        new_admin.put()
        other_admin.put()
    
        verify_token._mock_return_value = {'email': new_admin.email[0]}
        invite = mocks.create_invite(admin, third_inst.key, 'USER_ADM', new_admin.key.urlsafe())

        self.assertTrue(
            has_admin_permissions(admin, institution.key.urlsafe()),
            'Admin must have super user permissions for this institution!'
        )
        self.assertTrue(
            has_admin_permissions(admin, second_inst.key.urlsafe()),
            'Admin must have super user permissions for second_inst institution!'
        )
        self.assertTrue(
            has_admin_permissions(admin, third_inst.key.urlsafe()),
            'Admin must have super user permissions for third_inst institution!'
        )
        self.assertTrue(
            has_admin_permissions(other_admin, second_inst.key.urlsafe()),
            'other_admin must have super user permissions for second_inst institution!'    
        )
        self.assertFalse(
            has_admin_permissions(new_admin, institution.key.urlsafe()),
            'new_admin should not have super user permissions for this institution!'
        )
        self.assertFalse(
            has_admin_permissions(new_admin, second_inst.key.urlsafe()),
            'new_admin should not have super user permissions for the second_inst institution!'
        )
        self.assertFalse(
            has_admin_permissions(new_admin, third_inst.key.urlsafe()),
            'new_admin should not have super user permissions for the third_inst institution!'
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
            has_admin_permissions(admin, institution.key.urlsafe()),
            'admin must have super user permissions for this institution!'
        )
        self.assertTrue(
            has_admin_permissions(admin, second_inst.key.urlsafe()),
            'Admin must have super user permissions for second_inst institution!'
        )
        self.assertTrue(
            has_admin_permissions(admin, third_inst.key.urlsafe()),
            'Admin must have super user permissions for third_inst institution!'    
        )
        self.assertTrue(
            has_admin_permissions(other_admin, second_inst.key.urlsafe()),
            'other_admin must have super user permissions for second_inst institution!'
        )
        self.assertFalse(
            has_admin_permissions(new_admin, institution.key.urlsafe()),
            'new_admin should not have super user permissions for this institution!'
        )
        self.assertFalse(
            has_admin_permissions(new_admin, second_inst.key.urlsafe()),
            'new_admin should not have super user permissions for the second_inst institution!'
        )
        self.assertTrue(
            has_admin_permissions(new_admin, third_inst.key.urlsafe()),
            'New_admin must have super user permissions for third_inst institution!'
        )
        self.assertEquals(
            new_admin.key, 
            third_inst.admin,
            'New_admin must be the administrator of the institution!'
        )
    @patch('models.invite_user_adm.InviteUserAdm.send_notification')
    @patch('handlers.invite_user_adm_handler.enqueue_task')
    @patch('utils.verify_token', return_value={'email': 'usr_test@test.com'})
    def test_put_invite_with_super_user_admin_of_parent_inst(self, verify_token, enqueue_task, send_notification):
        """Test put invite with user super user and is admin of parent institution."""
        enqueue_task.side_effect = self.enqueue_task

        admin = mocks.create_user()
        new_admin = mocks.create_user()

        institution = mocks.create_institution()
        second_inst = mocks.create_institution()
        second_inst.name = "Departamento do Complexo Industrial e Inovacao em Saude"
        third_inst = mocks.create_institution()

        institution.set_admin(admin.key)
        institution.add_member(admin)
        institution.children_institutions = [second_inst.key]

        # Departamento do Complexo Industrial e Inovacao em Saude
        # Admin of this institution is Super User
        second_inst.set_admin(admin.key)
        second_inst.add_member(new_admin)
        second_inst.parent_institution = institution.key
        second_inst.children_institutions = [third_inst.key]

        third_inst.set_admin(admin.key)
        third_inst.add_member(admin)
        third_inst.add_member(new_admin)
        third_inst.parent_institution = second_inst.key

        admin.add_institution_admin(institution.key)
        admin.add_institution_admin(second_inst.key)
        admin.add_institution_admin(third_inst.key)
        add_admin_permission(admin, institution.key.urlsafe())
        add_admin_permission(admin, second_inst.key.urlsafe())
        add_super_user_permission(admin, second_inst.key.urlsafe())
        add_admin_permission(admin, third_inst.key.urlsafe())

        institution.put()
        second_inst.put()
        third_inst.put()
        admin.put()
        new_admin.put()
    
        verify_token._mock_return_value = {'email': new_admin.email[0]}
        invite = mocks.create_invite(admin, second_inst.key, 'USER_ADM', new_admin.key.urlsafe())

        # Permissions of admin before transferring administration
        self.assertTrue(
            has_admin_permissions(admin, institution.key.urlsafe()),
            'Admin must have admin permissions for this institution!'
        )
        self.assertTrue(
            has_admin_permissions(admin, second_inst.key.urlsafe()),
            'Admin must have admin user permissions for second_inst institution!'
        )
        self.assertTrue(
            has_super_user_permissions(admin, second_inst.key.urlsafe()),
            'Admin must have super user permissions for second_inst institution!'
        )
        self.assertTrue(
            has_admin_permissions(admin, third_inst.key.urlsafe()),
            'Admin must have admin user permissions for third_inst institution!'
        )

        # Permissions of new_admin before transferring administration
        self.assertFalse(
            has_admin_permissions(new_admin, institution.key.urlsafe()),
            'Admin must have admin permissions for this institution!'
        )
        self.assertFalse(
            has_admin_permissions(new_admin, second_inst.key.urlsafe()),
            'Admin must have not admin user permissions for second_inst institution!'
        )
        self.assertFalse(
            has_super_user_permissions(new_admin, second_inst.key.urlsafe()),
            'Admin must have not super user permissions for second_inst institution!'
        )
        self.assertFalse(
            has_admin_permissions(new_admin, third_inst.key.urlsafe()),
            'Admin must have not admin user permissions for third_inst institution!'
        )

        self.testapp.put('/api/invites/%s/institution_adm' %(invite.key.urlsafe()))

        institution = institution.key.get()
        second_inst = second_inst.key.get()
        third_inst = third_inst.key.get()
        admin = admin.key.get()
        new_admin = new_admin.key.get()
        invite = invite.key.get()

        # Admin permissions after transferring administration
        self.assertTrue(
            has_admin_permissions(admin, institution.key.urlsafe()),
            'admin must have super user permissions for this institution!'
        )
        self.assertTrue(
            has_admin_permissions(admin, second_inst.key.urlsafe()),
            'Admin must have super user permissions for second_inst institution!'
        )
        self.assertFalse(
            has_super_user_permissions(admin, second_inst.key.urlsafe()),
            "Admin shouldn't have super user permissions for second_inst institution!"
        )
        self.assertTrue(
            has_admin_permissions(admin, third_inst.key.urlsafe()),
            'Admin must have super user permissions for third_inst institution!'    
        )

        # New_admin permissions after transfering administration
        self.assertTrue(
            has_admin_permissions(new_admin, second_inst.key.urlsafe()),
            'new_admin must have admin user permissions for second_inst institution!'
        )
        self.assertTrue(
            has_super_user_permissions(new_admin, second_inst.key.urlsafe()),
            'new_admin must have super user permissions for second_inst institution!'
        )
        self.assertFalse(
            has_admin_permissions(new_admin, institution.key.urlsafe()),
            'new_admin should not have super user permissions for this institution!'
        )
        self.assertTrue(
            has_admin_permissions(new_admin, third_inst.key.urlsafe()),
            'New_admin must have admin user permissions for third_inst institution!'
        )
    
    @patch('models.invite_user_adm.InviteUserAdm.send_notification')
    @patch('handlers.invite_user_adm_handler.enqueue_task')
    @patch('utils.verify_token', return_value={'email': 'usr_test@test.com'})
    def test_put_invite_super_user(self, verify_token, enqueue_task, send_notification):
        """Test put invite with user is admin of parent institution."""
        enqueue_task.side_effect = self.enqueue_task

        admin = mocks.create_user()
        new_admin = mocks.create_user()

        institution = mocks.create_institution()
        institution.name = "Departamento do Complexo Industrial e Inovacao em Saude"
        institution.set_admin(admin.key)
        institution.add_member(admin)
        institution.add_member(new_admin)

        new_admin.add_institution(institution.key)
        admin.add_institution(institution.key)        
        admin.add_institution_admin(institution.key)
        
        add_admin_permission(admin, institution.key.urlsafe())
        add_super_user_permission(admin, institution.key.urlsafe())

        institution.put()
        admin.put()
        new_admin.put()
    
        verify_token._mock_return_value = {'email': new_admin.email[0]}
        invite = mocks.create_invite(admin, institution.key, 'USER_ADM', new_admin.key.urlsafe())

        self.assertTrue(
            has_admin_permissions(admin, institution.key.urlsafe()),
            'Admin must have administrative permissions!'
        )
        self.assertTrue(
            has_super_user_permissions(admin, institution.key.urlsafe()),
            'Admin must have super user permissions for this institution!'
        )    
        self.assertFalse(
            has_admin_permissions(new_admin, institution.key.urlsafe()),
            'new_admin should not have administrative permissions for this institution!'
        )
        self.assertFalse(
            has_super_user_permissions(new_admin, institution.key.urlsafe()),
            'new_admin should not have super user permissions for this institution!'
        )   

        self.testapp.put('/api/invites/%s/institution_adm' %(invite.key.urlsafe()))

        institution = institution.key.get()
        admin = admin.key.get()
        new_admin = new_admin.key.get()
        invite = invite.key.get()

        self.assertFalse(
            has_admin_permissions(admin, institution.key.urlsafe()),
            'admin must have super user permissions for this institution!'
        )
        self.assertFalse(
            has_super_user_permissions(admin, institution.key.urlsafe()),
            'admin must have super user permissions for this institution!'
        )
        self.assertTrue(
            has_admin_permissions(new_admin, institution.key.urlsafe()),
            'Admin must have super user permissions for second_inst institution!'
        )
        self.assertTrue(
            has_super_user_permissions(new_admin, institution.key.urlsafe()),
            'Admin must have super user permissions for second_inst institution!'
        )

    @patch('utils.verify_token', return_value={'email': 'usr_test@test.com'})
    def test_put_accepted_and_rejected_invite(self, verify_token):
        """Test put accepted and rejected invite."""
        admin = mocks.create_user()
        new_admin = mocks.create_user()

        institution = mocks.create_institution()
        institution.set_admin(admin.key)
        institution.add_member(admin)
        institution.add_member(new_admin)

        admin.add_institution_admin(institution.key)
        add_admin_permission(admin, institution.key.urlsafe())

        institution.put()
        admin.put()
        new_admin.put()
    
        invite = mocks.create_invite(admin, institution.key, 'USER_ADM', new_admin.key.urlsafe())
        invite.change_status('accepted')

        self.assertTrue(
            has_admin_permissions(admin, institution.key.urlsafe()),
            'Admin must have super user permissions for this institution!'
        )
        self.assertFalse(
            has_admin_permissions(new_admin, institution.key.urlsafe()),
            'New_admin should not have super user permissions for this institution!'
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
            has_admin_permissions(admin, institution.key.urlsafe()),
            'Admin must have super user permissions for this institution!'
        )
        self.assertFalse(
            has_admin_permissions(new_admin, institution.key.urlsafe()),
            'New_admin should not have super user permissions for this institution!'
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
            has_admin_permissions(admin, institution.key.urlsafe()),
            'Admin must have super user permissions for this institution!'
        )
        self.assertFalse(
            has_admin_permissions(new_admin, institution.key.urlsafe()),
            'New_admin should not have super user permissions for this institution!'
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

    @patch('utils.verify_token', return_value={'email': 'usr_test@test.com'})
    def test_put_invite_not_allowed(self, verify_token):
        """Test put invite not allowed."""
        admin = mocks.create_user()
        new_admin = mocks.create_user()

        institution = mocks.create_institution()
        institution.set_admin(admin.key)
        institution.add_member(admin)
        institution.add_member(new_admin)

        admin.add_institution_admin(institution.key)
        add_admin_permission(admin, institution.key.urlsafe())

        institution.put()
        admin.put()
        new_admin.put()
    
        invite = mocks.create_invite(admin, institution.key, 'USER')

        self.assertTrue(
            has_admin_permissions(admin, institution.key.urlsafe()),
            'Admin must have super user permissions for this institution!'
        )
        self.assertFalse(
            has_admin_permissions(new_admin, institution.key.urlsafe()),
            'New_admin should not have super user permissions for this institution!'    
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
            has_admin_permissions(admin, institution.key.urlsafe()), 
            'Admin must have super user permissions for this institution!'
        )
        self.assertFalse(
            has_admin_permissions(new_admin, institution.key.urlsafe()),
            'New_admin should not have super user permissions for this institution!'
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
    @patch('utils.verify_token', return_value={'email': 'usr_test@test.com'})
    def test_delete(self, verify_token, send_notification):
        """Test reject invite."""
        admin = mocks.create_user()
        new_admin = mocks.create_user()

        institution = mocks.create_institution()
        institution.set_admin(admin.key)
        institution.add_member(admin)
        institution.add_member(new_admin)

        admin.add_institution_admin(institution.key)
        add_admin_permission(admin, institution.key.urlsafe())

        institution.put()
        admin.put()
        new_admin.put()
    
        invite = mocks.create_invite(admin, institution.key, 'USER_ADM', new_admin.key.urlsafe())
        self.assertTrue(
            has_admin_permissions(admin, institution.key.urlsafe()), 
            'Admin must have super user permissions for this institution!'
        )
        self.assertFalse(
            has_admin_permissions(new_admin, institution.key.urlsafe()),
            'New_admin should not have super user permissions for this institution!'
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
            has_admin_permissions(admin, institution.key.urlsafe()),
            'Admin must have super user permissions for this institution!'
        )
        self.assertFalse(
            has_admin_permissions(new_admin, institution.key.urlsafe()),
            'New_admin should not have super user permissions for this institution!'
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
