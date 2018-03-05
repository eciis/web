# -*- coding: utf-8 -*-
"""Invite User Adm Handler test."""


import json
import mocks

from test_base_handler import TestBaseHandler
from google.appengine.ext import ndb
from models.invite import Invite
from handlers.invite_user_adm_handler import InviteUserAdmHandler
from worker import TransferAdminPermissionsHandler
import permissions

from mock import patch

def addAdminPermission(user, institution_key):
    for permission in permissions.DEFAULT_ADMIN_PERMISSIONS:
        if permission in user.permissions:
            user.permissions[permission].update({institution_key: True})
        else:
            user.permissions.update({permission: {institution_key: True}})

def hasAdminPermissions(user, institution_key):
    for permission in permissions.DEFAULT_ADMIN_PERMISSIONS:
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

    @patch('handlers.invite_user_adm_handler.enqueue_task')
    @patch('utils.verify_token', return_value={'email': 'usr_test@test.com'})
    def test_put(self, verify_token, enqueue_task):
        """Test put method  in inviteUserAdmHandler."""
        enqueue_task.side_effect = self.enqueue_task

        admin = mocks.create_user()
        new_admin = mocks.create_user()

        institution = mocks.create_institution()
        institution.admin = admin.key
        institution.members = [admin.key, new_admin.key]

        admin.institutions_admin = [institution.key]
        addAdminPermission(admin, institution.key.urlsafe())

        institution.put()
        admin.put()
        new_admin.put()
    
        verify_token._mock_return_value = {'email': new_admin.email[0]}
        invite = mocks.create_invite(admin, institution.key, 'USER_ADM')

        self.assertTrue(hasAdminPermissions(admin, institution.key.urlsafe()))
        self.assertFalse(hasAdminPermissions(new_admin, institution.key.urlsafe()))
        self.assertEquals(admin.key, institution.admin)

        self.testapp.put('/api/invites/%s/institution_adm' %(invite.key.urlsafe()))

        institution = institution.key.get()
        admin = admin.key.get()
        new_admin = new_admin.key.get()
        invite = invite.key.get()

        self.assertFalse(hasAdminPermissions(admin, institution.key.urlsafe()))
        self.assertTrue(hasAdminPermissions(new_admin, institution.key.urlsafe()))
        self.assertEquals(new_admin.key, institution.admin)
        self.assertEquals(invite.status, 'accepted')
    
    @patch('utils.verify_token', return_value={'email': 'usr_test@test.com'})
    def test_put_accepted_and_rejected_invite(self, verify_token):
        """Test put accepted and rejected invite."""
        admin = mocks.create_user()
        new_admin = mocks.create_user()

        institution = mocks.create_institution()
        institution.admin = admin.key
        institution.members = [admin.key, new_admin.key]

        admin.institutions_admin = [institution.key]
        addAdminPermission(admin, institution.key.urlsafe())

        institution.put()
        admin.put()
        new_admin.put()
    
        invite = mocks.create_invite(admin, institution.key, 'USER_ADM')
        invite.change_status('accepted')

        self.assertTrue(hasAdminPermissions(admin, institution.key.urlsafe()))
        self.assertFalse(hasAdminPermissions(new_admin, institution.key.urlsafe()))
        self.assertEquals(admin.key, institution.admin)

        with self.assertRaises(Exception) as raises_context:
            self.testapp.put('/api/invites/%s/institution_adm' %(invite.key.urlsafe()))
        
        institution = institution.key.get()
        admin = admin.key.get()
        new_admin = new_admin.key.get()

        self.assertTrue(hasAdminPermissions(admin, institution.key.urlsafe()))
        self.assertFalse(hasAdminPermissions(new_admin, institution.key.urlsafe()))
        self.assertEquals(admin.key, institution.admin)
        self.assertEquals(invite.status, 'accepted')

        message_exception = self.get_message_exception(str(raises_context.exception))
        self.assertEqual(message_exception, 'Error! This invitation has already been accepted')

        invite.change_status('rejected')

        with self.assertRaises(Exception) as raises_context:
            self.testapp.put('/api/invites/%s/institution_adm' %(invite.key.urlsafe()))
        
        institution = institution.key.get()
        admin = admin.key.get()
        new_admin = new_admin.key.get()
        invite = invite.key.get()

        self.assertTrue(hasAdminPermissions(admin, institution.key.urlsafe()))
        self.assertFalse(hasAdminPermissions(new_admin, institution.key.urlsafe()))
        self.assertEquals(admin.key, institution.admin)
        self.assertEquals(invite.status, 'rejected')

        message_exception = self.get_message_exception(str(raises_context.exception))
        self.assertEqual(message_exception, 'Error! This invitation has already been rejected')

    @patch('utils.verify_token', return_value={'email': 'usr_test@test.com'})
    def test_put_invite_not_allowed(self, verify_token):
        """Test put invite not allowed."""
        admin = mocks.create_user()
        new_admin = mocks.create_user()

        institution = mocks.create_institution()
        institution.admin = admin.key
        institution.members = [admin.key, new_admin.key]

        admin.institutions_admin = [institution.key]
        addAdminPermission(admin, institution.key.urlsafe())

        institution.put()
        admin.put()
        new_admin.put()
    
        invite = mocks.create_invite(admin, institution.key, 'USER')

        self.assertTrue(hasAdminPermissions(admin, institution.key.urlsafe()))
        self.assertFalse(hasAdminPermissions(new_admin, institution.key.urlsafe()))
        self.assertEquals(admin.key, institution.admin)

        with self.assertRaises(Exception) as raises_context:
            self.testapp.put('/api/invites/%s/institution_adm' %(invite.key.urlsafe()))
        
        institution = institution.key.get()
        admin = admin.key.get()
        new_admin = new_admin.key.get()
        invite = invite.key.get()

        self.assertTrue(hasAdminPermissions(admin, institution.key.urlsafe()))
        self.assertFalse(hasAdminPermissions(new_admin, institution.key.urlsafe()))
        self.assertEquals(admin.key, institution.admin)
        self.assertEquals(invite.status, 'sent')

        message_exception = self.get_message_exception(str(raises_context.exception))
        self.assertEqual(message_exception, 'Error! invitation type not allowed')

    @patch('utils.verify_token', return_value={'email': 'usr_test@test.com'})
    def test_delete(self, verify_token):
        """Test reject invite."""
        admin = mocks.create_user()
        new_admin = mocks.create_user()

        institution = mocks.create_institution()
        institution.admin = admin.key
        institution.members = [admin.key, new_admin.key]

        admin.institutions_admin = [institution.key]
        addAdminPermission(admin, institution.key.urlsafe())

        institution.put()
        admin.put()
        new_admin.put()
    
        invite = mocks.create_invite(admin, institution.key, 'USER_ADM')
        self.assertTrue(hasAdminPermissions(admin, institution.key.urlsafe()))
        self.assertFalse(hasAdminPermissions(new_admin, institution.key.urlsafe()))
        self.assertEquals(admin.key, institution.admin)

        self.testapp.delete('/api/invites/%s/institution_adm' %(invite.key.urlsafe()))
        
        institution = institution.key.get()
        admin = admin.key.get()
        new_admin = new_admin.key.get()
        invite = invite.key.get()

        self.assertTrue(hasAdminPermissions(admin, institution.key.urlsafe()))
        self.assertFalse(hasAdminPermissions(new_admin, institution.key.urlsafe()))
        self.assertEquals(admin.key, institution.admin)
        self.assertEquals(invite.status, 'rejected')
