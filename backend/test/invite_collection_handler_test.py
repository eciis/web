# -*- coding: utf-8 -*-
"""Invite Collection handler test."""

import json
import mocks

from test_base_handler import TestBaseHandler
from google.appengine.ext import ndb
from models.invite import Invite
from handlers.invite_collection_handler import InviteCollectionHandler

from mock import patch

ADMIN = {'email': 'user1@gmail.com'}
USER = {'email': 'otheruser@ccc.ufcg.edu.br'}
CURRENT_INSTITUTION = {'name': 'currentInstitution'}

def create_body(invitee_emails, admin, institution):
    """Create a body for the post method."""
    body = {
        'data': {
            'invite_body': {
                'admin_key': admin.key.urlsafe(),
                'type_of_invite': 'USER',
                'institution_key': institution.key.urlsafe()
            },
            'emails': invitee_emails
        }
    }
    return body


class InviteCollectionHandlerTest(TestBaseHandler):
    """Invite Collection handler test."""

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(InviteCollectionHandlerTest, cls).setUp()
        app = cls.webapp2.WSGIApplication(
            [("/api/invites", InviteCollectionHandler),
             ], debug=True)

        cls.testapp = cls.webtest.TestApp(app)
        cls.admin = mocks.create_user(ADMIN['email'])
        cls.institution = mocks.create_institution()
        cls.admin.institutions_admin = [cls.institution.key]
        cls.institution.admin = cls.admin.key
        cls.institution.add_member(cls.admin)
        cls.admin.add_institution(cls.institution.key)
        cls.admin.add_permission("invite_members",cls.institution.key.urlsafe())
        cls.otheruser = mocks.create_user(USER['email'])
        cls.otherinst = mocks.create_institution()
        cls.otherinst.address = mocks.create_address()
        cls.otherinst.add_member(cls.otheruser)


    @patch('utils.verify_token', return_value=ADMIN)
    def test_post_invite_institution(self, verify_token):

        invite = self.testapp.post_json("/api/invites", {'data': {
            'invitee': 'ana@gmail.com',
            'admin_key': self.admin.key.urlsafe(),
            'type_of_invite': 'INSTITUTION_PARENT',
            'suggestion_institution_name': 'New Institution',
            'institution_key': self.institution.key.urlsafe()}},
            headers={'Institution-Authorization': self.institution.key.urlsafe()})

        # Retrieve the entities
        invite = json.loads(invite._app_iter[0])
        key_invite = ndb.Key(urlsafe=invite['invites'][0]['key'])
        invite_obj = key_invite.get()

        # Check data of invite
        self.assertEqual(invite_obj.invitee, 'ana@gmail.com',
                         "The email expected was ana@gmail.com")
        self.assertEqual(invite_obj.admin_key, self.admin.key,
                         "The admin_key expected was first_user")
        self.assertEqual(invite_obj.suggestion_institution_name,
                         'New Institution',
                         "The suggestion institution name of \
                          invite expected was New Institution")

    
    @patch('utils.verify_token', return_value=ADMIN)
    def test_post_invite_institution_without_suggestion_name(self, verify_token):
        # Check if raise exception when the invite is for
        # institution and not specify the suggestion institution name.

        with self.assertRaises(Exception) as raises_context:
            self.testapp.post_json("/api/invites", {'data': {
                'invitee': 'ana@gmail.com',
                'admin_key': self.admin.key.urlsafe(),
                'institution_key': self.institution.key.urlsafe(),
                'type_of_invite': 'INSTITUTION_PARENT'}})

        message_exception = self.get_message_exception(str(raises_context.exception))
        self.assertEqual(
            message_exception,
            "Error! The invite for institution have to specify the suggestion institution name",
            "Expected exception message must be equal to " +
            "Error! The invite for institution have to specify the suggestion institution name")

    @patch('utils.verify_token', return_value=ADMIN)
    def test_post_invite_institution_parent(self, verify_token):
        #Test the invite_collection_handler's post method in case to parent institution.

        invite = self.testapp.post_json("/api/invites", {'data': {
            'invitee': 'user1@gmail.com',
            'admin_key': self.admin.key.urlsafe(),
            'type_of_invite': 'INSTITUTION_PARENT',
            'suggestion_institution_name': 'Institution Parent',
            'institution_key': self.institution.key.urlsafe()}},
            headers={'Institution-Authorization': self.institution.key.urlsafe()})

        # Retrieve the entities
        invite = json.loads(invite._app_iter[0])
        key_invite = ndb.Key(urlsafe=invite['invites'][0]['key'])
        invite_obj = key_invite.get()
        stub_institution = invite_obj.stub_institution_key
        stub_institution_obj = stub_institution.get()
        children_institutions = invite_obj.institution_key
        children_institutions_obj = children_institutions.get()

        # Check data of invite
        self.assertEqual(invite_obj.invitee, 'user1@gmail.com',
                         "The email expected was user1@gmail.com")
        self.assertEqual(invite_obj.suggestion_institution_name,
                         'Institution Parent',
                         "The suggestion institution name of \
                              invite expected was Institution Parent")

        # Check data of stub parent Institution
        self.assertEqual(stub_institution_obj.name, 'Institution Parent',
                         "The name of stub expected was 'Institution Parent'")
        self.assertEqual(stub_institution_obj.state, 'pending',
                         "The state of stub expected was pending")
        self.assertEqual(stub_institution_obj.children_institutions[0],
                         self.institution.key,
                         "The children institution of stub\
                         was institution")

        # Check data of institution children
        self.assertEqual(children_institutions_obj.key, self.institution.key,
                         "The children institution of stub\
                         was institution")
        self.assertEqual(children_institutions_obj.parent_institution,
                         stub_institution_obj.key,
                         "The parent institution of stub\
                         was stub")

   
    @patch('handlers.invite_collection_handler.enqueue_task')
    @patch('utils.verify_token', return_value=ADMIN)
    def test_post_invite_user(self, verify_token, enqueue_task):

        body = create_body(['ana@gmail.com'], self.admin, self.institution)

        answer = self.testapp.post_json("/api/invites", body, 
            headers={'institution-authorization': self.institution.key.urlsafe()})
        # Retrieve the entities
        answer = json.loads(answer._app_iter[0])
        enqueue_task.assert_called()
        
        self.assertEqual(
            answer["msg"], 'The invites are being processed.')

        #The entity 'invites' is an array that contains email and key of invites
        invite = answer['invites'][0]
        self.assertEqual(invite['email'], 'ana@gmail.com')
        self.assertTrue(invite['key'])

    @patch('handlers.invite_collection_handler.enqueue_task')
    @patch('utils.verify_token', return_value=ADMIN)
    def test_post_invite_user_member_of_other_institution(self, verify_token, enqueue_task):

        body = create_body([USER['email']], self.admin, self.institution)

        answer = self.testapp.post_json("/api/invites", body, 
            headers={'institution-authorization': self.institution.key.urlsafe()})
        answer = json.loads(answer._app_iter[0])

        self.assertEqual(
            answer["msg"], 'The invites are being processed.')
        
        invite = answer['invites'][0]
        self.assertEqual(invite['email'], 'otheruser@ccc.ufcg.edu.br')
        self.assertTrue(invite['key'])

        enqueue_task.assert_called()

    @patch.object(Invite, 'send_invite')
    @patch('utils.verify_token', return_value=USER)
    def test_post_invite_without_admin(self, verify_token, send_invite):
        """ Check if raise exception when the admin_key is not admistrator."""
        body = create_body(['ana@gmail.com'], self.admin, self.institution)
        with self.assertRaises(Exception) as raises_context:
            self.testapp.post_json("/api/invites", body)

        message_exception = self.get_message_exception(str(raises_context.exception))

        self.assertEqual(
            message_exception,
            "Error! User is not allowed to send invites",
            "Expected exception message must be equal to Error! User is not allowed to send invites")
        
        # assert the invite was not sent
        send_invite.assert_not_called()
    
    @patch('handlers.invite_collection_handler.enqueue_task')
    @patch('utils.verify_token', return_value=ADMIN)
    def test_post_many_invites_at_once(self, verify_token, enqueue_task):

        body = create_body(
            ['ana@gmail.com', 'user@hotmail.com', 'test@example.com', 'other@other.com'], 
            self.admin,
            self.institution
        )

        answer = self.testapp.post_json("/api/invites", body,
                                        headers={'institution-authorization': self.institution.key.urlsafe()})
        # Retrieve the entities
        answer = json.loads(answer._app_iter[0])

        self.assertEqual(
            answer["msg"], 'The invites are being processed.')

        invite = answer['invites'][0]
        self.assertEqual(invite['email'], 'ana@gmail.com')
        self.assertTrue(invite['key'])
        
        enqueue_task.assert_called()
