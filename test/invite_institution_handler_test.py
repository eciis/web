"""Invite Institution Handler Test."""

from test_base_handler import TestBaseHandler
from models.institution import Institution
from models.institution import Address
from models.user import User
from handlers.invite_institution_handler import InviteInstitutionHandler

from mock import patch


class InviteInstitutionHandlerTest(TestBaseHandler):
    """Invite Institution handler test."""

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(InviteInstitutionHandlerTest, cls).setUp()
        app = cls.webapp2.WSGIApplication(
            [("/api/invites/institution", InviteInstitutionHandler),
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)
        initModels(cls)

    @patch('utils.verify_token', return_value={'email': 'first_user@gmail.com'})
    def test_post_invite_institution(self, verify_token):
        self.testapp.post_json("/api/invites/institution", {
            'invitee': 'ana@gmail.com',
            'admin_key': self.first_user.key.urlsafe(),
            'type_of_invite': 'INSTITUTION',
            'suggestion_institution_name': 'New Institution',
            'institution_key': self.institution.key.urlsafe()})

    @patch('utils.verify_token', return_value={'email': 'first_user@gmail.com'})
    def test_post_invite_institution_fail(self, verify_token):
        with self.assertRaises(Exception) as ex:
            self.testapp.post_json("/api/invites/institution", {
                'invitee': 'ana@gmail.com',
                'admin_key': self.first_user.key.urlsafe(),
                'type_of_invite': 'INSTITUTION_PARENT',
                'suggestion_institution_name': 'New Institution',
                'institution_key': self.institution.key.urlsafe()})

        message = self.get_message_exception(ex.exception.message)
        self.assertEqual(
            message,
            'Error! invitation type not allowed',
            'Expected exception message muste be equal to Error! invitation type not allowed')


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
    cls.first_user.permissions['send_invite_inst'] = 'sdgjhagdjhgsjg'
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
