# -*- coding: utf-8 -*-
"""Invite Hierarchy Collection handler test."""

from .. import mocks
import json
from permissions import DEFAULT_ADMIN_PERMISSIONS
from ..test_base_handler import TestBaseHandler
from google.appengine.ext import ndb
from handlers import InviteHierarchyCollectionHandler
from mock import patch
from models import Invite



def create_body(invitee, admin, institution, type_of_invite):
    """Create a body for the post method."""
    body = {
        'data': {
            'invite_body': {
                'invitee': invitee,
                'admin_key': admin.key.urlsafe(),
                'institution_key': institution.key.urlsafe(),
                'type_of_invite': type_of_invite,
                'suggestion_institution_name': 'new_inst'
            }
        }
    }
    
    return body

class InviteHierachyCollectionHandlerTest(TestBaseHandler):

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(InviteHierachyCollectionHandlerTest, cls).setUp()
        app = cls.webapp2.WSGIApplication(
            [("/api/invites/hierarchy", InviteHierarchyCollectionHandler)], debug=True)
        cls.testapp = cls.webtest.TestApp(app)
    

    @patch('util.login_service.verify_token')
    @patch('handlers.invite_hierarchy_collection_handler.enqueue_task')
    def test_post_invite_instituion_children(self, enqueue_task, verify_token):
        """Test post invite instituion children."""
        admin = mocks.create_user()
        other_user = mocks.create_user()
        institution = mocks.create_institution()

        institution.add_member(admin)
        institution.set_admin(admin.key)

        admin.add_permissions(DEFAULT_ADMIN_PERMISSIONS, institution.key.urlsafe())
        admin.put()
        institution.put()

        invite_body = create_body(other_user.email[0], admin, institution, 'INSTITUTION_CHILDREN')

        verify_token._mock_return_value = {'email': admin.email[0]}
        response = self.testapp.post_json(
            '/api/invites/hierarchy', 
            invite_body, 
            headers={'institution-authorization': institution.key.urlsafe()}
        )

        invite = ndb.Key(urlsafe=response.json['invite']['key']).get()

        expected_make = {
            'invitee': other_user.email[0],
            'type_of_invite': "INSTITUTION_CHILDREN",
            'admin_name': admin.name,
            'sender_name': admin.name,
            'key': invite.key.urlsafe(),
            'status': 'sent',
            'institution_admin': institution.make(['name']),
            'institution': institution.make(Invite.INST_PROPS_TO_MAKE),
            'suggestion_institution_name': 'new_inst',
            'stub_institution': invite.stub_institution_key.get().make(['name', 'key', 'state'])
        }

        self.assertEquals(expected_make, invite.make())

    @patch('util.login_service.verify_token')
    @patch('handlers.invite_hierarchy_collection_handler.enqueue_task')
    def test_post_invite_instituion_parent(self, enqueue_task, verify_token):
        """Test post invite instituion parent."""
        admin = mocks.create_user()
        other_user = mocks.create_user()
        institution = mocks.create_institution()

        institution.add_member(admin)
        institution.set_admin(admin.key)

        admin.add_permissions(DEFAULT_ADMIN_PERMISSIONS, institution.key.urlsafe())
        admin.put()
        institution.put()

        invite_body = create_body(other_user.email[0], admin, institution, 'INSTITUTION_PARENT')

        verify_token._mock_return_value = {'email': admin.email[0]}
        response = self.testapp.post_json(
            '/api/invites/hierarchy', 
            invite_body, 
            headers={'institution-authorization': institution.key.urlsafe()}
        )

        invite = ndb.Key(urlsafe=response.json['invite']['key']).get()

        expected_make = {
            'invitee': other_user.email[0],
            'type_of_invite': "INSTITUTION_PARENT",
            'admin_name': admin.name,
            'sender_name': admin.name,
            'key': invite.key.urlsafe(),
            'status': 'sent',
            'institution_admin': institution.make(['name']),
            'institution': institution.make(Invite.INST_PROPS_TO_MAKE),
            'suggestion_institution_name': 'new_inst',
            'stub_institution': invite.stub_institution_key.get().make(['name', 'key', 'state'])
        }

        self.assertEquals(expected_make, invite.make())

        enqueue_task.assert_called_with(
            'send-invite',
            {
                'invites_keys': json.dumps([invite.key.urlsafe()]), 
                'host': response.request.host,
                'current_institution': institution.key.urlsafe()
            }
        )
    
    @patch('util.login_service.verify_token')
    def test_post_invalid_invite_type(self, verify_token):
        """Test post invalid invite type."""
        admin = mocks.create_user()
        other_user = mocks.create_user()
        institution = mocks.create_institution()

        institution.add_member(admin)
        institution.set_admin(admin.key)

        admin.add_permissions(DEFAULT_ADMIN_PERMISSIONS, institution.key.urlsafe())
        admin.put()
        institution.put()

        invite_body = create_body([other_user.email[0]], admin, institution, 'USER')

        verify_token._mock_return_value = {'email': admin.email[0]}
        with self.assertRaises(Exception) as raises_context:
            self.testapp.post_json(
                '/api/invites/hierarchy', 
                invite_body, 
                headers={'institution-authorization': institution.key.urlsafe()}
            )

        message = self.get_message_exception(str(raises_context.exception))

        self.assertEqual(
            message,
            'Error! invitation type not allowed',
            "Expected error message is Error! invitation type not allowed"
        )
    
    @patch('util.login_service.verify_token')
    def test_post_invite_user_not_admin(self, verify_token):
        """Test post invite user not admin."""
        admin = mocks.create_user()
        other_user = mocks.create_user()
        institution = mocks.create_institution()

        institution.add_member(admin)
        institution.set_admin(admin.key)

        admin.put()
        institution.put()

        invite_body = create_body([other_user.email[0]], admin, institution, 'INSTITUTION_CHILDREN')

        verify_token._mock_return_value = {'email': admin.email[0]}
        with self.assertRaises(Exception) as raises_context:
            self.testapp.post_json(
                '/api/invites/hierarchy', 
                invite_body, 
                headers={'institution-authorization': institution.key.urlsafe()}
            )

        message = self.get_message_exception(str(raises_context.exception))

        self.assertEqual(
            message,
            'Error! User is not allowed to send hierarchy invites',
            "Expected error message is Error! User is not allowed to send hierarchy invites"
        )
