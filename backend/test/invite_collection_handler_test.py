# -*- coding: utf-8 -*-
"""Invite Collection handler test."""

from test_base_handler import TestBaseHandler
from models.institution import Institution
from models.institution import Address
from models.user import User
from handlers.invite_collection_handler import InviteCollectionHandler
from google.appengine.ext import ndb
import json

from mock import patch


class InviteCollectionHandlerTest(TestBaseHandler):
    """Invite Collection handler test."""
    # TODO:
    # Fix the post method, to check specific exceptions and error messages
    # @author Mayza Nunes 07-07-2017

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(InviteCollectionHandlerTest, cls).setUp()
        app = cls.webapp2.WSGIApplication(
            [("/api/invites", InviteCollectionHandler),
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)
        initModels(cls)

    @patch('utils.verify_token', return_value={'email': 'first_user@gmail.com'})
    def test_post_invite_institution(self, verify_token):
        invite = self.testapp.post_json("/api/invites", {
            'invitee': 'ana@gmail.com',
            'admin_key': self.first_user.key.urlsafe(),
            'type_of_invite': 'INSTITUTION_PARENT',
            'suggestion_institution_name': 'New Institution',
            'institution_key': self.institution.key.urlsafe()})

        # Retrieve the entities
        invite = json.loads(invite._app_iter[0])
        key_invite = ndb.Key(urlsafe=invite['key'])
        invite_obj = key_invite.get()

        # Check data of invite
        self.assertEqual(invite_obj.invitee, 'ana@gmail.com',
                         "The email expected was ana@gmail.com")
        self.assertEqual(invite_obj.admin_key, self.first_user.key,
                         "The admin_key expected was first_user")
        self.assertEqual(invite_obj.suggestion_institution_name,
                         'New Institution',
                         "The suggestion institution name of \
                          invite expected was New Institution")

    @patch('utils.verify_token', return_value={'email': 'first_user@gmail.com'})
    def test_post_invite_institution_without_suggestion_name(self, verify_token):
        """ Check if raise exception when the invite is for
        institution and not specify the suggestion institution name."""
        with self.assertRaises(Exception) as raises_context:
            self.testapp.post_json("/api/invites", {
                'invitee': 'ana@gmail.com',
                'admin_key': self.first_user.key.urlsafe(),
                'institution_key': self.institution.key.urlsafe(),
                'type_of_invite': 'INSTITUTION_PARENT'})

        message_exception = self.get_message_exception(str(raises_context.exception))
        self.assertEqual(
            message_exception,
            "Error! The invite for institution have to specify the suggestion institution name",
            "Expected exception message must be equal to " +
            "Error! The invite for institution have to specify the suggestion institution name")

    @patch('utils.verify_token', return_value={'email': 'first_user@gmail.com'})
    def test_post_invite_user(self, verify_token):
        invite = self.testapp.post_json("/api/invites", {
            'invitee': 'ana@gmail.com',
            'admin_key': self.first_user.key.urlsafe(),
            'type_of_invite': 'USER',
            'institution_key': self.institution.key.urlsafe()})
        # Retrieve the entities
        invite = json.loads(invite._app_iter[0])
        key_invite = ndb.Key(urlsafe=invite['key'])
        invite_obj = key_invite.get()

        # Check data of invite
        self.assertEqual(invite_obj.invitee, 'ana@gmail.com',
                         "The email expected was ana@gmail.com")
        self.assertEqual(invite_obj.admin_key, self.first_user.key,
                         "The admin_key expected was first_user")
        self.assertEqual(invite_obj.institution_key, self.institution.key,
                         "The institution key expected was key of institution")

    @patch('utils.verify_token', return_value={'email': 'second_user@ccc.ufcg.edu.br'})
    def test_post_invite_user_member_of_other_institution(self, verify_token):
        invite = self.testapp.post_json("/api/invites", {
            'invitee': 'third_user@ccc.ufcg.edu.br',
            'admin_key': self.second_user.key.urlsafe(),
            'type_of_invite': 'USER',
            'institution_key': self.other_institution.key.urlsafe()})
        # Retrieve the entities
        invite = json.loads(invite._app_iter[0])
        key_invite = ndb.Key(urlsafe=invite['key'])
        invite_obj = key_invite.get()

        # Check data of invite
        self.assertEqual(invite_obj.invitee, 'third_user@ccc.ufcg.edu.br',
                         "The email expected was third_user@ccc.ufcg.edu.br")
        self.assertEqual(invite_obj.admin_key, self.second_user.key,
                         "The admin_key expected was second_user")
        self.assertEqual(invite_obj.institution_key, self.other_institution.key,
                         "The institution key expected was key of other_institution")

    @patch('utils.verify_token', return_value={'email': 'first_user@gmail.com'})
    def test_post_invite_user_already_member(self, verify_token):
        """ Check if raise exception when the invite is
        for user already member of institution."""
        with self.assertRaises(Exception) as raises_context:
            self.testapp.post_json("/api/invites", {
                'invitee': 'second_user@ccc.ufcg.edu.br',
                'admin_key': self.first_user.key.urlsafe(),
                'type_of_invite': 'USER',
                'institution_key': self.institution.key.urlsafe()})

        message_exception = self.get_message_exception(str(raises_context.exception))

        self.assertEqual(
            message_exception,
            "Error! The invitee is already a member",
            "Expected exception message must be equal to " +
            "Error! The invitee is already a member")

    @patch('utils.verify_token', return_value={'email': 'first_user@gmail.com'})
    def test_post_invite_user_without_inst_key(self, verify_token):
        """ Check if raise exception when the invite is
        for user and not specify the institution key."""
        with self.assertRaises(Exception) as raises_context:
            self.testapp.post_json("/api/invites", {
                'invitee': 'ana@gmail.com',
                'admin_key': self.first_user.key.urlsafe(),
                'type_of_invite': 'USER'})

        message_exception = self.get_message_exception(str(raises_context.exception))

        self.assertEqual(
            message_exception,
            "Error! 'institution_key'",
            "Expected exception message must be equal to Error! 'institution_key'")

    @patch('utils.verify_token', return_value={'email': 'second_user@ccc.ufcg.edu.br'})
    def test_post_invite_without_admin(self, verify_token):
        """ Check if raise exception when the admin_key is not admistrator."""
        with self.assertRaises(Exception) as raises_context:
            self.testapp.post_json("/api/invites", {
                'invitee': 'ana@gmail.com',
                'admin_key': self.first_user.key.urlsafe(),
                'type_of_invite': 'USER',
                'institution_key': self.institution.key.urlsafe()})

        message_exception = self.get_message_exception(str(raises_context.exception))

        self.assertEqual(
            message_exception,
            "Error! User is not admin",
            "Expected exception message must be equal to Error! User is not admin")

    @patch('utils.verify_token', return_value={'email': 'first_user@gmail.com'})
    def test_post_invite_institution_parent(self, verify_token):
        """Test the invite_collection_handler's post method in case to parent institution."""

        invite = self.testapp.post_json("/api/invites", {
            'invitee': 'first_user@gmail.com',
            'admin_key': self.first_user.key.urlsafe(),
            'type_of_invite': 'INSTITUTION_PARENT',
            'suggestion_institution_name': 'Institution Parent',
            'institution_key': self.institution.key.urlsafe()})
        # Retrieve the entities
        invite = json.loads(invite._app_iter[0])
        key_invite = ndb.Key(urlsafe=invite['key'])
        invite_obj = key_invite.get()
        stub_institution = invite_obj.stub_institution_key
        stub_institution_obj = stub_institution.get()
        children_institutions = invite_obj.institution_key
        children_institutions_obj = children_institutions.get()

        # Check data of invite
        self.assertEqual(invite_obj.invitee, 'first_user@gmail.com',
                         "The email expected was first_user@gmail.com")
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

    @patch('utils.verify_token', return_value={'email': 'first_user@gmail.com'})
    def test_post_invite_inst_parent_without_inst_key(self, verify_token):
        """ Check if raise exception when the invite is
        for user and not specify the institution key."""
        with self.assertRaises(Exception) as raises_context:
            self.testapp.post_json("/api/invites", {
                'invitee': 'first_user@gmail.com',
                'type_of_invite': 'INSTITUTION_PARENT'})

        message_exception = self.get_message_exception(str(raises_context.exception))

        self.assertEqual(
            message_exception,
            "Error! 'institution_key'",
            "Expected exception message must be equal to Error! 'institution_key'")


def initModels(cls):
    """Init the models."""
    # new Institution Address
    cls.address = Address()
    cls.address.number = '01'
    cls.address.street = 'street'
    # new Institution
    cls.institution = Institution()
    cls.institution.name = 'institution'
    cls.institution.address = cls.address
    cls.institution.put()
    # new User
    cls.first_user = User()
    cls.first_user.name = 'first_user'
    cls.first_user.email = ['first_user@gmail.com']
    cls.first_user.institutions = [cls.institution.key]
    cls.first_user.institutions_admin = [cls.institution.key]
    cls.first_user.put()
    # new User
    cls.second_user = User()
    cls.second_user.name = 'second_user'
    cls.second_user.email = ['second_user@ccc.ufcg.edu.br']
    cls.second_user.put()
    # new User
    cls.third_user = User()
    cls.third_user.name = 'third_user'
    cls.third_user.email = ['third_user@ccc.ufcg.edu.br']
    cls.third_user.put()
    # new Institution other_institution
    cls.other_institution = Institution()
    cls.other_institution.name = 'other_institution'
    cls.other_institution.address = cls.address
    cls.other_institution.members = [cls.first_user.key]
    cls.other_institution.followers = [cls.third_user.key]
    cls.other_institution.admin = cls.second_user.key
    cls.other_institution.put()
    # set first_user to be admin of institution
    cls.institution.admin = cls.first_user.key
    cls.institution.members = [cls.first_user.key, cls.second_user.key, cls.third_user.key]
    cls.institution.put()
    cls.second_user.institutions_admin = [cls.other_institution.key]
    cls.second_user.put()
