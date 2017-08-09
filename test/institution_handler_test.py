# -*- coding: utf-8 -*-
"""Post handler test."""

from test_base_handler import TestBaseHandler
from models.invite import Invite
from models.user import User
from models.institution import Institution
from handlers.institution_handler import InstitutionHandler

from mock import patch


class InstitutionHandlerTest(TestBaseHandler):
    """Test the post_handler class."""

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(InstitutionHandlerTest, cls).setUp()
        methods = set(cls.webapp2.WSGIApplication.allowed_methods)
        methods.add('PATCH')
        cls.webapp2.WSGIApplication.allowed_methods = frozenset(methods)
        app = cls.webapp2.WSGIApplication(
            [
             ("/api/institutions/(.*)/invites/(.*)", InstitutionHandler),
             ("/api/institutions/(.*)", InstitutionHandler),
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)
        initModels(cls)

    @patch('utils.verify_token', return_value={'email': 'mayzabeel@gmail.com'})
    def test_patch(self, verify_token):
        """Test the post_handler's patch method."""
        # Call the patch method and assert that  it raises an exception
        self.testapp.patch_json("/api/institutions/%s"
                                % (self.certbio.key.urlsafe()),
                                [{"op": "replace", "path": "/name",
                                    "value": "Nova Inst update"}]
                                )

        self.inst_create = self.certbio.key.get()
        self.assertEqual(self.inst_create.name, "Nova Inst update",
                         "The institution name expected was Nova Inst update")

        # Pretend a new authentication
        verify_token.return_value = {'email': 'raoni.smaneoto@ccc.ufcg.edu.br'}

        # Check if raise Exception when the user who send patch is not the admin
        with self.assertRaises(Exception):
            self.testapp.patch_json("/api/institutions/%s"
                                    % (self.certbio.key.urlsafe()),
                                    [{"op": "replace", "path": "/name",
                                      "value": "Nova Inst update"}]
                                    )

    @patch('utils.verify_token', return_value={'email': 'raoni.smaneoto@ccc.ufcg.edu.br'})
    def test_post(self, verify_token):
        """Test the post_handler's post method."""
        # Call the patch method and assert that  it raises an exception
        self.testapp.post("/api/institutions/%s/invites/%s"
                                % (self.stub.key.urlsafe(), self.invite.key.urlsafe()))

        self.inst_create = self.stub.key.get()
        self.assertEqual(self.inst_create.admin, self.raoni.key,
                         "The Admin of institution expected was Raoni")
        self.assertEqual(self.inst_create.followers, [self.raoni.key],
                         "The follower of institution expected was Raoni")
        self.assertEqual(self.inst_create.members, [self.raoni.key],
                         "The memeber of institution expected was Raoni")

        self.userUpdated = self.raoni.key.get()

        self.assertEqual(self.userUpdated.institutions_admin, [self.inst_create.key],
                         "The institution admin by Raoni expected was Inst create")

        self.assertEqual(self.userUpdated.state, "active",
                         "The state of Raoni expected was active")

        self.inviteUpdate = self.invite.key.get()

        self.assertEqual(self.inviteUpdate.status, "accepted",
                         "The status invite expected was accepted")

        # Pretend a new authentication
        verify_token.return_value = {'email': 'mayzabeel@gmail.com'}

        # Check if raise Exception when the user who send patch is not the invitee
        with self.assertRaises(Exception):
            self.testapp.post("/api/institutions/%s/invites/%s"
                                    % (self.stub.key.urlsafe(), self.invite.key.urlsafe()),
                                    [{"op": "replace", "path": "/name",
                                      "value": "Nova Inst update"}]
                                    )

    def tearDown(cls):
        """Deactivate the test."""
        cls.test.deactivate()


def initModels(cls):
    """Init the models."""
    # new User Mayza
    cls.mayza = User()
    cls.mayza.name = 'Mayza Nunes'
    cls.mayza.cpf = '089.675.908-90'
    cls.mayza.email = 'mayzabeel@gmail.com'
    cls.mayza.institutions = []
    cls.mayza.follows = []
    cls.mayza.institutions_admin = []
    cls.mayza.notifications = []
    cls.mayza.posts = []
    cls.mayza.put()
    # new User Raoni
    cls.raoni = User()
    cls.raoni.name = 'Raoni Smaneoto'
    cls.raoni.cpf = '089.675.908-65'
    cls.raoni.email = 'raoni.smaneoto@ccc.ufcg.edu.br'
    cls.raoni.state = "pending"
    cls.raoni.institutions = []
    cls.raoni.follows = []
    cls.raoni.institutions_admin = []
    cls.raoni.notifications = []
    cls.raoni.posts = []
    cls.raoni.put()
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
    cls.certbio.members = [cls.mayza.key, cls.raoni.key]
    cls.certbio.followers = [cls.mayza.key, cls.raoni.key]
    cls.certbio.posts = []
    cls.certbio.admin = cls.mayza.key
    cls.certbio.put()
    cls.mayza.institutions_admin = [cls.certbio.key]
    cls.mayza.put()
    # Invite for Raoni create new inst
    cls.invite = Invite()
    cls.invite.invitee = 'raoni.smaneoto@ccc.ufcg.edu.br'
    cls.invite.inviter = 'mayzabeel@gmail.com'
    cls.invite.type_of_invite = 'institution'
    cls.invite.suggestion_institution_name = "Nova Inst"
    cls.invite.put()
    # Stub of Institution
    cls.stub = Institution()
    cls.stub.name = 'Nova Inst'
    cls.stub.state = 'pending'
    cls.stub.put()
    # update invite
    cls.invite.stub_institution_key = cls.stub.key
    cls.invite.put()
