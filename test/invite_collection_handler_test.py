# -*- coding: utf-8 -*-
"""Invite Collection handler test."""

from test_base_handler import TestBaseHandler
from models.institution import Institution
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
        """Test the post_collection_handler's post method."""
        # Pretend an authentication
        self.os.environ['REMOTE_USER'] = 'mayzabeel@gmail.com'
        self.os.environ['USER_EMAIL'] = 'mayzabeel@gmail.com'
        # Make the request and assign the answer to post
        invite = self.testapp.post_json("/api/invites", {
            'invitee': 'mayzabeel@gmail.com',
            'type_of_invite': 'institution',
            'suggestion_institution_name': 'New Institution'})
        # Retrieve the entities
        invite = json.loads(invite._app_iter[0])
        key_invite = ndb.Key(urlsafe=invite['key'])
        invite_obj = key_invite.get()

        # Check if the post's key is in institution and user
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

    def test_post_invite_user(self):
        """Test the post_collection_handler's post method."""
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

        # Check if the post's key is in institution and user
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


def initModels(cls):
    """Init the models."""
    # new Institution CERTBIO
    cls.certbio = Institution()
    cls.certbio.name = 'CERTBIO'
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
