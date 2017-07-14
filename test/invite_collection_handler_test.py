# -*- coding: utf-8 -*-
"""Invite Collection handler test."""

from test_base_handler import TestBaseHandler
from models.institution import Institution
from models.user import User
from handlers.invite_collection_handler import InviteCollectionHandler
from google.appengine.ext import ndb
import json


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
        initModels(cls)

    def test_post_invite_institution(self):
        """Test the invite_collection_handler's post method."""
        # Pretend an authentication
        self.os.environ['REMOTE_USER'] = 'mayzabeel@gmail.com'
        self.os.environ['USER_EMAIL'] = 'mayzabeel@gmail.com'
        # Make the request and assign the answer to post
        invite = self.testapp.post_json("/api/invites", {
            'invitee': 'mayzabeel@gmail.com',
            'type_of_invite': 'institution',
            'suggestion_institution_name': 'New Institution',
            'institution_key': self.certbio.key.urlsafe()})
        # Retrieve the entities
        invite = json.loads(invite._app_iter[0])
        key_invite = ndb.Key(urlsafe=invite['key'])
        invite_obj = key_invite.get()

        # Check data of invite
        self.assertEqual(invite_obj.invitee, 'mayzabeel@gmail.com',
                         "The email expected was mayzabeel@gmail.com")
        self.assertEqual(invite_obj.type_of_invite, 'institution',
                         "The type of invite expected was institution")
        self.assertEqual(invite_obj.suggestion_institution_name,
                         'New Institution',
                         "The suggestion institution name of \
                          invite expected was New Institution")

        """ Check if raise exception when the invite is for
        institution and not specify the suggestion institution name."""
        # TODO:
        # Fix the post method.
        # The try except block prevents that FieldException be raised
        # @author Mayza Nunes 04-07-2017
        with self.assertRaises(Exception):
            self.testapp.post_json("/api/invites", {
                'invitee': 'mayzabeel@gmail.com',
                'type_of_invite': 'institution'})

    def test_post_invite_institution_parent(self):
        """Test the invite_collection_handler's post method in case to parent institution."""
        # Pretend an authentication
        self.os.environ['REMOTE_USER'] = 'mayzabeel@gmail.com'
        self.os.environ['USER_EMAIL'] = 'mayzabeel@gmail.com'
        # Make the request and assign the answer to post
        invite = self.testapp.post_json("/api/invites", {
            'invitee': 'mayzabeel@gmail.com',
            'type_of_invite': 'institution_parent',
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
        self.assertEqual(invite_obj.type_of_invite, 'institution_parent',
                         "The type of invite expected was institution_parent")
        self.assertEqual(invite_obj.suggestion_institution_name,
                         'Institution Parent',
                         "The suggestion institution name of \
                              invite expected was Institution Parent")

        # Check data of stub
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

        """ Check if raise exception when the invite is
        for user and not specify the institution key."""
        with self.assertRaises(Exception):
            self.testapp.post_json("/api/invites", {
                'invitee': 'mayzabeel@gmail.com',
                'type_of_invite': 'institution_parent'})

    def test_post_invite_user(self):
        """Test the invite_collection_handler's post method."""
        # Pretend an authentication
        self.os.environ['REMOTE_USER'] = 'mayzabeel@gmail.com'
        self.os.environ['USER_EMAIL'] = 'mayzabeel@gmail.com'
        # Make the request and assign the answer to post
        invite = self.testapp.post_json("/api/invites", {
            'invitee': 'mayzabeel@gmail.com',
            'type_of_invite': 'user',
            'institution_key': self.certbio.key.urlsafe()})
        # Retrieve the entities
        invite = json.loads(invite._app_iter[0])

        key_invite = ndb.Key(urlsafe=invite['key'])
        invite_obj = key_invite.get()

        # Check data of invite
        self.assertEqual(invite_obj.invitee, 'mayzabeel@gmail.com',
                         "The email expected was mayzabeel@gmail.com")
        self.assertEqual(invite_obj.type_of_invite, 'user',
                         "The type of invite expected was user")
        self.assertEqual(invite_obj.institution_key, self.certbio.key,
                         "The institution key expected was key of certbio")

        """ Check if raise exception when the invite is
        for user and not specify the institution key."""
        # TODO:
        # Fix the post method.
        # The try except block prevents that FieldException be raised
        # @author Mayza Nunes 04-07-2017
        with self.assertRaises(Exception):
            self.testapp.post_json("/api/invites", {
                'invitee': 'mayzabeel@gmail.com',
                'type_of_invite': 'user'})

    def test_post_invite_user_error(self):
        """Test the invite_collection_handler's post
        method when the inviter is not a administrator."""
        # Pretend an authentication
        self.os.environ['REMOTE_USER'] = 'tiago.pereira@ccc.ufcg.edu.br'
        self.os.environ['USER_EMAIL'] = 'tiago.pereira@ccc.ufcg.edu.br'

        """ Check if raise exception when the inviter id not admistrator."""
        # TODO:
        # Fix the post method.
        # The try except block prevents that NotAuthorizedException be raised
        # @author Mayza Nunes 07-07-2017
        with self.assertRaises(Exception):
            self.testapp.post_json("/api/invites", {
                'invitee': 'mayzabeel@gmail.com',
                'type_of_invite': 'user',
                'institution_key': self.certbio.key.urlsafe()})


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
    cls.mayza.institutions = []
    cls.mayza.follows = []
    cls.mayza.institutions_admin = [cls.certbio.key]
    cls.mayza.notifications = []
    cls.mayza.posts = []
    cls.mayza.put()
    # set Mayza to be admin of Certbio
    cls.certbio.admin = cls.mayza.key
    cls.certbio.put()
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
