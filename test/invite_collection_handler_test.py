# -*- coding: utf-8 -*-
"""Invite Collection handler test."""

from test_base_handler import TestBaseHandler
from models.institution import Institution
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

    @patch('utils.verify_token', return_value={'email': 'mayzabeel@gmail.com'})
    def test_post_invite_institution(self, verify_token):
        invite = self.testapp.post_json("/api/invites", {
            'invitee': 'ana@gmail.com',
            'inviter': 'mayzabeel@gmail.com',
            'type_of_invite': 'INSTITUTION',
            'suggestion_institution_name': 'New Institution',
            'institution_key': self.certbio.key.urlsafe()})

        # Retrieve the entities
        invite = json.loads(invite._app_iter[0])
        key_invite = ndb.Key(urlsafe=invite['key'])
        invite_obj = key_invite.get()

        # Check data of invite
        self.assertEqual(invite_obj.invitee, 'ana@gmail.com',
                         "The email expected was ana@gmail.com")
        self.assertEqual(invite_obj.inviter, 'mayzabeel@gmail.com',
                         "The inviter expected was mayzabeel@gmail.com")
        self.assertEqual(invite_obj.suggestion_institution_name,
                         'New Institution',
                         "The suggestion institution name of \
                          invite expected was New Institution")


    @patch('utils.verify_token', return_value={'email': 'mayzabeel@gmail.com'})
    def test_post_invite_institution_without_suggestion_name(self, verify_token):
        """ Check if raise exception when the invite is for
        institution and not specify the suggestion institution name."""
        with self.assertRaises(Exception):
            self.testapp.post_json("/api/invites", {
                'invitee': 'ana@gmail.com',
                'inviter': 'mayzabeel@gmail.com',
                'type_of_invite': 'INSTITUTION'})

    @patch('utils.verify_token', return_value={'email': 'mayzabeel@gmail.com'})
    def test_post_invite_user(self, verify_token):
        invite = self.testapp.post_json("/api/invites", {
            'invitee': 'ana@gmail.com',
            'inviter': 'mayzabeel@gmail.com',
            'type_of_invite': 'USER',
            'institution_key': self.certbio.key.urlsafe()})
        # Retrieve the entities
        invite = json.loads(invite._app_iter[0])
        key_invite = ndb.Key(urlsafe=invite['key'])
        invite_obj = key_invite.get()

        # Check data of invite
        self.assertEqual(invite_obj.invitee, 'ana@gmail.com',
                         "The email expected was ana@gmail.com")
        self.assertEqual(invite_obj.inviter, 'mayzabeel@gmail.com',
                         "The inviter expected was mayzabeel@gmail.com")
        self.assertEqual(invite_obj.institution_key, self.certbio.key,
                         "The institution key expected was key of certbio")

    @patch('utils.verify_token', return_value={'email': 'tiago.pereira@ccc.ufcg.edu.br'})
    def test_post_invite_user_member_of_other_institution(self, verify_token):
        invite = self.testapp.post_json("/api/invites", {
            'invitee': 'adriana@ccc.ufcg.edu.br',
            'inviter': 'tiago.pereira@ccc.ufcg.edu.br',
            'type_of_invite': 'USER',
            'institution_key': self.splab.key.urlsafe()})
        # Retrieve the entities
        invite = json.loads(invite._app_iter[0])
        key_invite = ndb.Key(urlsafe=invite['key'])
        invite_obj = key_invite.get()

        # Check data of invite
        self.assertEqual(invite_obj.invitee, 'adriana@ccc.ufcg.edu.br',
                         "The email expected was adriana@ccc.ufcg.edu.br")
        self.assertEqual(invite_obj.inviter, 'tiago.pereira@ccc.ufcg.edu.br',
                         "The inviter expected was tiago.pereira@ccc.ufcg.edu.br")
        self.assertEqual(invite_obj.institution_key, self.splab.key,
                         "The institution key expected was key of splab")

    @patch('utils.verify_token', return_value={'email': 'mayzabeel@gmail.com'})
    def test_post_invite_user_already_member(self, verify_token):
        """ Check if raise exception when the invite is
        for user already member of institution."""
        with self.assertRaises(Exception):
            self.testapp.post_json("/api/invites", {
                'invitee': 'tiago.pereira@ccc.ufcg.edu.br',
                'inviter': 'mayzabeel@gmail.com',
                'type_of_invite': 'USER',
                'institution_key': self.certbio.key.urlsafe()})

    @patch('utils.verify_token', return_value={'email': 'mayzabeel@gmail.com'})
    def test_post_invite_user_without_inst_key(self, verify_token):
        """ Check if raise exception when the invite is
        for user and not specify the institution key."""
        with self.assertRaises(Exception):
            self.testapp.post_json("/api/invites", {
                'invitee': 'ana@gmail.com',
                'inviter': 'mayzabeel@gmail.com',
                'type_of_invite': 'USER'})

    @patch('utils.verify_token', return_value={'email': 'tiago.pereira@ccc.ufcg.edu.br'})
    def test_post_invite_without_admin(self, verify_token):
        """ Check if raise exception when the inviter is not admistrator."""
        with self.assertRaises(Exception):
            self.testapp.post_json("/api/invites", {
                'invitee': 'ana@gmail.com',
                'inviter': 'mayzabeel@gmail.com',
                'type_of_invite': 'USER',
                'institution_key': self.certbio.key.urlsafe()})

    @patch('utils.verify_token', return_value={'email': 'mayzabeel@gmail.com'})
    def test_post_invite_institution_parent(self, verify_token):
        """Test the invite_collection_handler's post method in case to parent institution."""

        invite = self.testapp.post_json("/api/invites", {
            'invitee': 'mayzabeel@gmail.com',
            'inviter': 'mayzabeel@gmail.com',
            'type_of_invite': 'INSTITUTION_PARENT',
            'suggestion_institution_name': 'Institution Parent',
            'institution_key': self.certbio.key.urlsafe()})
        # Retrieve the entities
        invite = json.loads(invite._app_iter[0])
        key_invite = ndb.Key(urlsafe=invite['key'])
        invite_obj = key_invite.get()
        stub_institution = invite_obj.stub_institution_key
        stub_institution_obj = stub_institution.get()
        children_institutions = invite_obj.institution_key
        children_institutions_obj = children_institutions.get()

        # Check data of invite
        self.assertEqual(invite_obj.invitee, 'mayzabeel@gmail.com',
                         "The email expected was mayzabeel@gmail.com")
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
                         self.certbio.key,
                         "The children institution of stub\
                         was Certbio")

        # Check data of institution children
        self.assertEqual(children_institutions_obj.key, self.certbio.key,
                         "The children institution of stub\
                         was Certbio")
        self.assertEqual(children_institutions_obj.parent_institution,
                         stub_institution_obj.key,
                         "The parent institution of stub\
                         was stub")

    @patch('utils.verify_token', return_value={'email': 'mayzabeel@gmail.com'})
    def test_post_invite_inst_parent_without_inst_key(self, verify_token):
        """ Check if raise exception when the invite is
        for user and not specify the institution key."""
        with self.assertRaises(Exception):
            self.testapp.post_json("/api/invites", {
                'invitee': 'mayzabeel@gmail.com',
                'type_of_invite': 'INSTITUTION_PARENT'})


def initModels(cls):
    """Init the models."""
    # new Institution CERTBIO
    cls.certbio = Institution()
    cls.certbio.name = 'CERTBIO'
    cls.certbio.acronym = 'CERTBIO'
    cls.certbio.cnpj = '18.104.068/0001-86'
    cls.certbio.legal_nature = 'public'
    cls.certbio.address = 'Universidade Federal de Campina Grande'
    cls.certbio.occupation_area = ''
    cls.certbio.description = 'Ensaio Químico'
    cls.certbio.email = 'certbio@ufcg.edu.br'
    cls.certbio.phone_number = '(83) 3322 4455'
    cls.certbio.members = []
    cls.certbio.followers = []
    cls.certbio.posts = []
    cls.certbio.put()
    # new User Mayza
    cls.mayza = User()
    cls.mayza.name = 'Mayza Nunes'
    cls.mayza.cpf = '089.675.908-90'
    cls.mayza.email = 'mayzabeel@gmail.com'
    cls.mayza.institutions = [cls.certbio.key]
    cls.mayza.follows = []
    cls.mayza.institutions_admin = [cls.certbio.key]
    cls.mayza.notifications = []
    cls.mayza.posts = []
    cls.mayza.put()
    # new User Tiago
    cls.tiago = User()
    cls.tiago.name = 'Tiago Pereira'
    cls.tiago.cpf = '089.675.908-65'
    cls.tiago.email = 'tiago.pereira@ccc.ufcg.edu.br'
    cls.tiago.institutions = []
    cls.tiago.follows = []
    cls.tiago.institutions_admin = []
    cls.tiago.notifications = []
    cls.tiago.posts = []
    cls.tiago.put()
    # new User Adroana
    cls.adriana = User()
    cls.adriana.name = 'Adriana'
    cls.adriana.cpf = '089.675.908-65'
    cls.adriana.email = 'adriana@ccc.ufcg.edu.br'
    cls.adriana.institutions = []
    cls.adriana.follows = []
    cls.adriana.institutions_admin = []
    cls.adriana.notifications = []
    cls.adriana.posts = []
    cls.adriana.put()
    # new Institution SPLAB
    cls.splab = Institution()
    cls.splab.name = 'SPLAB'
    cls.splab.acronym = 'SPLAB'
    cls.splab.cnpj = '18.104.068/0001-56'
    cls.splab.legal_nature = 'public'
    cls.splab.address = 'Universidade Federal de Campina Grande'
    cls.splab.occupation_area = ''
    cls.splab.description = 'The mission of the Software Practices Laboratory (SPLab)'
    cls.splab.email = 'splab@ufcg.edu.br'
    cls.splab.phone_number = '(83) 3322 7865'
    cls.splab.members = [cls.mayza.key]
    cls.splab.followers = [cls.adriana.key]
    cls.splab.posts = []
    cls.splab.admin = cls.tiago.key
    cls.splab.put()
    # set Mayza to be admin of Certbio
    cls.certbio.admin = cls.mayza.key
    cls.certbio.members = [cls.mayza.key, cls.tiago.key, cls.adriana.key]
    cls.certbio.put()
    cls.tiago.institutions_admin = [cls.splab.key]
    cls.tiago.put()