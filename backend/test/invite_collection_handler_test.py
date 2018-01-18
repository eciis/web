# -*- coding: utf-8 -*-
"""Invite Collection handler test."""

from test_base_handler import TestBaseHandler
from models.institution import Institution
from models.institution import Address
from models.user import User
from handlers.invite_collection_handler import InviteCollectionHandler
from google.appengine.ext import ndb
import json
import mocks

from mock import patch

ADMIN = {'email': 'user1@gmail.com'}
USER = {'email': 'otheruser@ccc.ufcg.edu.br'}


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

    """TODO: Uncomment test below when the hierarchical invitations can be available
    @author: Mayza Nunes 11/01/2018
    """
    """
    @patch('utils.verify_token', return_value=ADMIN)
    def test_post_invite_institution(self, verify_token):
        admin = mocks.create_user(ADMIN['email'])
        institution = mocks.create_institution()		 
        admin.institutions_admin = [institution.key]
        institution.admin = admin.key
        admin.add_permission("invite_members",institution.key.urlsafe())
        admin.put()
        institution.put()

        invite = self.testapp.post_json("/api/invites", {
            'invitee': 'ana@gmail.com',
            'admin_key': admin.key.urlsafe(),
            'type_of_invite': 'INSTITUTION_PARENT',
            'suggestion_institution_name': 'New Institution',
            'institution_key': institution.key.urlsafe()})

        # Retrieve the entities
        invite = json.loads(invite._app_iter[0])
        key_invite = ndb.Key(urlsafe=invite['key'])
        invite_obj = key_invite.get()

        # Check data of invite
        self.assertEqual(invite_obj.invitee, 'ana@gmail.com',
                         "The email expected was ana@gmail.com")
        self.assertEqual(invite_obj.admin_key, admin.key,
                         "The admin_key expected was first_user")
        self.assertEqual(invite_obj.suggestion_institution_name,
                         'New Institution',
                         "The suggestion institution name of \
                          invite expected was New Institution")

    
    @patch('utils.verify_token', return_value=ADMIN)
    def test_post_invite_institution_without_suggestion_name(self, verify_token):
        # Check if raise exception when the invite is for
        # institution and not specify the suggestion institution name.
        admin = mocks.create_user(ADMIN['email'])
        institution = mocks.create_institution()		 
        admin.institutions_admin = [institution.key]
        institution.admin = admin.key
        admin.add_permission("invite_members",institution.key.urlsafe())
        admin.put()
        institution.put()

        with self.assertRaises(Exception) as raises_context:
            self.testapp.post_json("/api/invites", {
                'invitee': 'ana@gmail.com',
                'admin_key': admin.key.urlsafe(),
                'institution_key': institution.key.urlsafe(),
                'type_of_invite': 'INSTITUTION_PARENT'})

        message_exception = self.get_message_exception(str(raises_context.exception))
        self.assertEqual(
            message_exception,
            "Error! The invite for institution have to specify the suggestion institution name",
            "Expected exception message must be equal to " +
            "Error! The invite for institution have to specify the suggestion institution name")
    
    @patch('utils.verify_token', return_value=ADMIN)
    def test_post_invite_institution_parent(self, verify_token):
        #Test the invite_collection_handler's post method in case to parent institution.
        admin = mocks.create_user(ADMIN['email'])
        institution = mocks.create_institution()		 
        admin.institutions_admin = [institution.key]
        institution.admin = admin.key
        admin.add_permission("invite_members",institution.key.urlsafe())
        admin.put()
        institution.put()

        invite = self.testapp.post_json("/api/invites", {
            'invitee': 'user1@gmail.com',
            'admin_key': admin.key.urlsafe(),
            'type_of_invite': 'INSTITUTION_PARENT',
            'suggestion_institution_name': 'Institution Parent',
            'institution_key': institution.key.urlsafe()})
        # Retrieve the entities
        invite = json.loads(invite._app_iter[0])
        key_invite = ndb.Key(urlsafe=invite['key'])
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
                         institution.key,
                         "The children institution of stub\
                         was institution")

        # Check data of institution children
        self.assertEqual(children_institutions_obj.key, institution.key,
                         "The children institution of stub\
                         was institution")
        self.assertEqual(children_institutions_obj.parent_institution,
                         stub_institution_obj.key,
                         "The parent institution of stub\
                         was stub")

    """
    @patch('utils.verify_token', return_value=ADMIN)
    def test_post_invite_user(self, verify_token):
        admin = mocks.create_user(ADMIN['email'])
        institution = mocks.create_institution()		 
        admin.institutions_admin = [institution.key]
        institution.admin = admin.key
        admin.add_permission("invite_members",institution.key.urlsafe())
        admin.put()
        institution.put()

        invite = self.testapp.post_json("/api/invites", {
            'invitee': 'ana@gmail.com',
            'admin_key': admin.key.urlsafe(),
            'type_of_invite': 'USER',
            'institution_key': institution.key.urlsafe()})
        # Retrieve the entities
        invite = json.loads(invite._app_iter[0])
        key_invite = ndb.Key(urlsafe=invite['key'])
        invite_obj = key_invite.get()

        # Check data of invite
        self.assertEqual(invite_obj.invitee, 'ana@gmail.com',
                         "The email expected was ana@gmail.com")
        self.assertEqual(invite_obj.admin_key, admin.key,
                         "The admin_key expected was first_user")
        self.assertEqual(invite_obj.institution_key, institution.key,
                         "The institution key expected was key of institution")

    @patch('utils.verify_token', return_value=ADMIN)
    def test_post_invite_user_member_of_other_institution(self, verify_token):
        admin = mocks.create_user(ADMIN['email'])
        institution = mocks.create_institution()		 
        admin.institutions_admin = [institution.key]
        institution.admin = admin.key
        admin.add_permission("invite_members",institution.key.urlsafe())
        admin.put()
        otheruser = mocks.create_user(USER['email'])
        otherinst = mocks.create_institution()
        otherinst.address = mocks.create_address()
        otherinst.add_member(otheruser)
        institution.put()

        invite = self.testapp.post_json("/api/invites", {
            'invitee': 'otheruser@ccc.ufcg.edu.br',
            'admin_key': admin.key.urlsafe(),
            'type_of_invite': 'USER',
            'institution_key': institution.key.urlsafe()})
        # Retrieve the entities
        invite = json.loads(invite._app_iter[0])
        key_invite = ndb.Key(urlsafe=invite['key'])
        invite_obj = key_invite.get()

        # Check data of invite
        self.assertEqual(invite_obj.invitee, 'otheruser@ccc.ufcg.edu.br',
                         "The email expected was otheruser@ccc.ufcg.edu.br")
        self.assertEqual(invite_obj.admin_key, admin.key,
                         "The admin_key expected was admin")
        self.assertEqual(invite_obj.institution_key, institution.key,
                         "The institution key expected was key of institution")

    @patch('utils.verify_token', return_value=ADMIN)
    def test_post_invite_user_already_member(self, verify_token):
        """ Check if raise exception when the invite is
        for user already member of institution."""
        admin = mocks.create_user(ADMIN['email'])
        institution = mocks.create_institution()		 
        admin.institutions_admin = [institution.key]
        institution.admin = admin.key
        admin.add_permission("invite_members",institution.key.urlsafe())
        admin.put()
        otheruser = mocks.create_user(USER['email'])
        institution.add_member(otheruser)
        institution.put()

        with self.assertRaises(Exception) as raises_context:
            self.testapp.post_json("/api/invites", {
                'invitee': 'otheruser@ccc.ufcg.edu.br',
                'admin_key': admin.key.urlsafe(),
                'type_of_invite': 'USER',
                'institution_key': institution.key.urlsafe()})

        message_exception = self.get_message_exception(str(raises_context.exception))

        self.assertEqual(
            message_exception,
            "Error! The invitee is already a member",
            "Expected exception message must be equal to " +
            "Error! The invitee is already a member")

    @patch('utils.verify_token', return_value=USER)
    def test_post_invite_without_admin(self, verify_token):
        """ Check if raise exception when the admin_key is not admistrator."""
        admin = mocks.create_user(ADMIN['email'])
        institution = mocks.create_institution()		 
        admin.institutions_admin = [institution.key]
        institution.admin = admin.key
        admin.add_permission("invite_members",institution.key.urlsafe())
        admin.put()
        institution.put()
        with self.assertRaises(Exception) as raises_context:
            self.testapp.post_json("/api/invites", {
                'invitee': 'ana@gmail.com',
                'admin_key': admin.key.urlsafe(),
                'type_of_invite': 'USER',
                'institution_key': institution.key.urlsafe()})

        message_exception = self.get_message_exception(str(raises_context.exception))

        self.assertEqual(
            message_exception,
            "Error! User is not allowed to send invites",
            "Expected exception message must be equal to Error! User is not allowed to send invites")
