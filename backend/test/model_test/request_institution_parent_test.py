# -*- coding: utf-8 -*-
"""Tests of model request institution parent."""

from ..test_base import TestBase
from models import RequestInstitutionParent, User, Invite
from custom_exceptions.fieldException import FieldException
from send_email_hierarchy.email_sender import EmailSender
from mock import patch
from .. import mocks


def generate_request(sender, institution, requested_institution, admin=None):
    """create and save a request."""
    admin_key = admin.key.urlsafe() if admin else sender.key.urlsafe()
    data = {
        'sender_key': sender.key.urlsafe(),
        'is_request': True,
        'admin_key': admin_key,
        'institution_key': institution.key.urlsafe(),
        'institution_requested_key': requested_institution.key.urlsafe(),
        'type_of_invite': 'REQUEST_INSTITUTION_PARENT'
    }

    request = RequestInstitutionParent.create(data)
    request.put()
    return request


class RequestInstitutionParentTest(TestBase):
    """Class request institution parent tests."""

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        cls.test = cls.testbed.Testbed()
        cls.test.activate()
        cls.policy = cls.datastore.PseudoRandomHRConsistencyPolicy(
            probability=1)
        cls.test.init_datastore_v3_stub(consistency_policy=cls.policy)
        cls.test.init_memcache_stub()
        
        """Initialize the models."""
        cls.admin = mocks.create_user()
        cls.other_user = mocks.create_user()
        
        cls.institution = mocks.create_institution()
        cls.institution.add_member(cls.admin)
        cls.institution.set_admin(cls.admin.key)

        cls.other_institution = mocks.create_institution()
        cls.other_institution.add_member(cls.other_user)
        cls.other_institution.set_admin(cls.other_user.key)


    def test_create(self):
        """Test create new request."""
        request = generate_request(
            self.admin, self.institution, 
            self.other_institution
        )

        self.assertEqual(
            request.admin_key,
            self.admin.key,
            'The request sender should be the admin')

        self.assertTrue(
            request.is_request,
            "The atribute is_request should be True")

        self.assertEqual(
            request.institution_key,
            self.institution.key,
            'The institution key should be equal to the expected one')

        self.assertEqual(
            request.institution_requested_key,
            self.other_institution.key,
            'The institution requested key should be equal to the expected one')

    
    def test_create_for_invited_institution(self):
        """Test create a request for an institution already invited."""
        generate_request(
            self.admin, self.institution, 
            self.other_institution
        )

        # try to create the same request
        with self.assertRaises(FieldException) as ex:
            generate_request(
                self.admin, self.institution, 
                self.other_institution
            )

        self.assertEqual(
            'The requested institution has already been invited',
            str(ex.exception),
            'The exception message is not equal to the expected one')


    def test_create_request_for_institution_linked(self):
        """Test create request for a linked institution."""
        self.other_institution.add_child(self.institution.key)
        self.institution.set_parent(self.other_institution.key)

        with self.assertRaises(FieldException) as ex:
            generate_request(
                self.other_user, self.institution,
                self.other_institution, self.admin
            )

        self.assertEqual(
            'The institutions has already been connected.',
            str(ex.exception),
            'Expected message is The institutions has already been connected')


    def test_create_request_for_institution_with_child(self):
        """Test create request for an institution
        that has the request one as a child."""
        self.other_institution.add_child(self.institution.key)

        try:
            generate_request(
                self.admin, self.institution, 
                self.other_institution
            )
        except Exception:
            self.fail("It should create a request for an institution with no parent.")

    
    def test_create_request_for_instituion_with_not_confirmed_parent(self):
        """Test create request for an institution that has a different parent."""
        other_parent = mocks.create_institution()
        self.institution.set_parent(other_parent.key)

        try:
            generate_request(
                self.admin, self.institution, 
                self.other_institution
            )
        except Exception:
            self.fail("It should create a request for other_institution.")

    
    def test_create_request_for_instituion_with_confirmed_parent(self):
        """Test create request for an institution that has a different parent."""
        other_parent = mocks.create_institution()
        other_parent.add_child(self.institution.key)
        self.institution.set_parent(other_parent.key)

        try:
            generate_request(
                self.admin, self.institution, 
                self.other_institution
            )
        except Exception:
            self.fail("It should create a request for other_institution.")


    def test_make(self):
        """Test method make for parent institution request."""
        request = generate_request(
            self.other_user, self.institution,
            self.other_institution, self.admin
        )

        expected_made_request = {
            'status': 'sent',
            'sender': self.other_user.email,
            'sender_name':  self.other_user.name, 
            'sender_key':  self.other_user.key.urlsafe(),
            'requested_inst_name': self.other_institution.name,
            'institution_requested_key': self.other_institution.key.urlsafe(),
            'admin_name': self.admin.name,
            'key': request.key.urlsafe(),
            'type_of_invite': 'REQUEST_INSTITUTION_PARENT',
            'institution_key': self.institution.key.urlsafe(),
            'institution_admin': {
                'name': self.institution.name
            },
            'institution': self.institution.make(RequestInstitutionParent.INST_PROPS_TO_MAKE),
            'requested_institution': self.other_institution.make(RequestInstitutionParent.INST_PROPS_TO_MAKE)
        }

        made_request = request.make()
                   
        self.assertEquals(made_request, expected_made_request,
        "The made request is not equal to the expected one")


    @patch.object(Invite, 'send_notification')
    @patch.object(Invite, 'create_notification_message', return_value='mocked_message')
    def test_send_notification(self, create_notification_message, send_notification):
        """Test send notification."""
        request = generate_request(
            self.admin, self.institution, 
            self.other_institution
        )

        request.send_notification(self.institution.key)
        
        create_notification_message.assert_called_with(
            user_key=self.admin.key, 
            current_institution_key=self.institution.key,
            sender_institution_key=self.institution.key,
            receiver_institution_key=self.other_institution.key
        )

        send_notification.assert_called_with(
            current_institution=self.institution.key, 
            receiver_key=self.other_institution.admin, 
            notification_type='REQUEST_INSTITUTION_PARENT',
            message='mocked_message'
        )


    @patch.object(Invite, 'send_notification')
    @patch.object(Invite, 'create_notification_message', return_value='mocked_message')
    def test_send_response_notification(self, create_notification_message, send_notification):
        """Test send response notification."""
        request = generate_request(
            self.admin, self.institution, 
            self.other_institution
        )

        for action in ['ACCEPT', 'REJECT']:
            request.send_response_notification(
                current_institution=self.other_institution.key, 
                invitee_key=self.other_institution.admin,
                action=action
            )
            
            create_notification_message.assert_called_with(
                user_key=self.other_institution.admin, 
                current_institution_key=self.other_institution.key,
                sender_institution_key=self.other_institution.key,
                receiver_institution_key=self.institution.key
            )

            notification_type = 'ACCEPT_INSTITUTION_LINK' if action == 'ACCEPT' else 'REJECT_INSTITUTION_LINK'
            send_notification.assert_called_with(
                current_institution=self.other_institution.key, 
                receiver_key=self.admin.key, 
                notification_type=notification_type,
                message='mocked_message'
            )
    

    @patch.object(EmailSender, 'send_email')
    def test_send_email(self, send_email):
        """Test send email."""
        request = generate_request(
            self.admin, self.institution,
            self.other_institution
        )

        parent_institution = self.other_institution
        child_institution = self.institution

        email_json = {
            'institution_parent_name': parent_institution.name,
            'institution_parent_email': parent_institution.institutional_email,
            'institution_child_name': child_institution.name,
            'institution_child_email': child_institution.institutional_email,
            'institution_requested_key': parent_institution.key.urlsafe()
        }

        request.send_email(host='somehost')
        send_email.assert_called_with(email_json)


    @patch.object(EmailSender, 'send_email')
    def test_send_response_email(self, send_email):
        """Test send response email."""
        request = generate_request(
            self.admin, self.institution, 
            self.other_institution
        )

        parent_institution = self.other_institution
        child_institution = self.institution

        email_json = {
            'institution_parent_name': parent_institution.name,
            'institution_parent_email': parent_institution.institutional_email,
            'institution_child_name': child_institution.name,
            'institution_child_email': child_institution.institutional_email,
            'institution_requested_key': parent_institution.key.urlsafe()
        }

        for operation in ["ACCEPT", "REJECT"]:
            request.send_response_email(operation)
            send_email.assert_called_with(email_json)
