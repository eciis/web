"""Invite Institution Handler Test."""

import mocks

from test_base_handler import TestBaseHandler
from models import Institution
from models import Address
from models import User
from models import Invite
from handlers.invite_institution_collection_handler import InviteInstitutionCollectionHandler
from mock import patch
from models.invite_institution import InviteInstitution

host = 'localhost:80'

class InviteInstitutionCollectionHandlerTest(TestBaseHandler):
    """Invite Institution handler test."""

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(InviteInstitutionCollectionHandlerTest, cls).setUp()
        app = cls.webapp2.WSGIApplication(
            [("/api/invites/institution", InviteInstitutionCollectionHandler),
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)

        # create models
        # new User
        cls.first_user = mocks.create_user('first_user@gmail.com')
        # new Institution
        cls.institution = mocks.create_institution()
        # set the institution admin to be the first user
        cls.first_user.institutions_admin = [cls.institution.key]
        cls.first_user.add_institution(cls.institution.key)
        cls.first_user.put()
        cls.institution.admin = cls.first_user.key
        cls.institution.add_member(cls.first_user)
        cls.institution.put()
        # update first user permissions
        cls.first_user.add_permission('send_invite_inst', cls.institution.key.urlsafe())
        cls.first_user.put()
        data = {
            'invitee': 'userA@gmail.com',
            'admin_key': cls.first_user.key.urlsafe(),
            'type_of_invite': 'INSTITUTION',
            'suggestion_institution_name': 'New Institution',
            'institution_key': cls.institution.key.urlsafe()
        }
        cls.body = {
            'data': data
        }

    @patch.object(Invite, 'send_invite')
    @patch('util.login_service.verify_token', return_value={'email': 'first_user@gmail.com'})
    def test_post_invite_institution(self, verify_token, send_invite):
        """Test post invite institution."""
        self.testapp.post_json("/api/invites/institution", self.body,
            headers={'institution-authorization':self.institution.key.urlsafe()})
        # assert the invite was sent to the invitee
        send_invite.assert_called_with(host, self.institution.key)
    
    @patch.object(Invite, 'send_invite')
    @patch('util.login_service.verify_token', return_value={'email': 'first_user@gmail.com'})
    def test_post_invite_institution_fail(self, verify_token, send_invite):
        """Test post invite institution fail."""
        with self.assertRaises(Exception) as ex:
            self.body['data']['type_of_invite'] = 'INSTITUTION_PARENT'
            self.testapp.post_json("/api/invites/institution", self.body)

        message = self.get_message_exception(ex.exception.message)
        self.assertEqual(
            message,
            'Error! invitation type not allowed',
            'Expected exception message must be equal to Error! invitation type not allowed')

        # assert the invite was not sent to the invitee
        send_invite.assert_not_called() 

    @patch.object(Invite, 'send_invite')
    @patch('util.login_service.verify_token', return_value={'email': 'second_user@ccc.ufcg.edu.br'})
    def test_post_user_not_allowed(self, verify_token, send_invite):
        """Test post user not allowed."""
        # new Institution
        other_institution = mocks.create_institution()
        # new user
        second_user = mocks.create_user('second_user@ccc.ufcg.edu.br')
        # set the other_institution admin to be the second_user
        second_user.institutions_admin = [other_institution.key]
        second_user.put()
        other_institution.admin = second_user.key
        other_institution.put()

        with self.assertRaises(Exception) as ex:
            self.body['data']['admin_key'] = second_user.key.urlsafe()
            self.body['data']['institution_key'] = other_institution.key.urlsafe()
            self.testapp.post_json("/api/invites/institution", self.body)

        message = self.get_message_exception(ex.exception.message)
        self.assertEqual(
            message,
            'Error! User is not allowed to post invite',
            'Expected exception message must be equal to Error! User is not allowed to post invite')
        
        # assert the invite was not sent to the invitee
        send_invite.assert_not_called() 

    @patch.object(Invite, 'send_invite')
    @patch('util.login_service.verify_token', return_value={'email': 'first_user@gmail.com'})
    def test_post_invite_institution_inactive(self, verify_token, send_invite):
        """Test post invite institution fail."""
        with self.assertRaises(Exception) as ex:
            self.institution.state = 'inactive'
            self.institution.put()
            self.testapp.post_json("/api/invites/institution", self.body)

        message = self.get_message_exception(ex.exception.message)
        self.assertEqual(
            message,
            "Error! This institution is not active",
            "Expected exception message must be equal to 'Error! This institution is not active'")
        
        # assert the invite was not sent to the invitee
        send_invite.assert_not_called()

    @patch('util.login_service.verify_token', return_value={'email': 'first_user@gmail.com'})
    def test_get(self, verify_token):
        """Test post invite institution fail."""
        invites = self.testapp.get("/api/invites/institution").json
        self.assertTrue(len(invites) == 0)

        #Creating some invites
        self.body['data']['type_of_invite'] = 'INSTITUTION'
        self.testapp.post_json("/api/invites/institution", self.body)

        invites = self.testapp.get("/api/invites/institution").json
        self.assertTrue(len(invites) == 1)

        self.testapp.post_json("/api/invites/institution", self.body)

        invites = self.testapp.get("/api/invites/institution").json
        self.assertTrue(len(invites) == 2)


        


        
