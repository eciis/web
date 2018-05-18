# -*- coding: utf-8 -*-
"""Institution member handler test."""

import mocks
import json

from test_base_handler import TestBaseHandler
from models import User
from models import Institution
from handlers.institution_members_handler import InstitutionMembersHandler
from mock import patch


class InstitutionMemberHandlerTest(TestBaseHandler):
    """Test Institution Member Handler class."""

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(InstitutionMemberHandlerTest, cls).setUp()
        app = cls.webapp2.WSGIApplication(
            [("/api/institutions/(.*)/members", InstitutionMembersHandler)
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)
        
        # create models
        # new User user
        cls.user = mocks.create_user('user@gmail.com')
        # new User second_user
        cls.second_user = mocks.create_user('second_user@ccc.ufcg.edu.br')
        # new Institution institution
        cls.institution = mocks.create_institution()
        cls.institution.members = [cls.user.key, cls.second_user.key]
        cls.institution.followers = [cls.user.key, cls.second_user.key]
        cls.institution.admin = cls.user.key
        cls.institution.put()
        # another institution
        cls.other_institution = mocks.create_institution()
        cls.other_institution.members = [cls.user.key]
        cls.other_institution.followers = [cls.user.key, cls.second_user.key]
        cls.other_institution.admin = cls.user.key
        cls.other_institution.put()
        # update user
        cls.user.institutions = [cls.institution.key, cls.other_institution.key]
        cls.user.follows = [cls.institution.key, cls.other_institution.key]
        cls.user.institutions_admin = [cls.institution.key, cls.other_institution.key]
        cls.user.add_permission("publish_post", cls.institution.key.urlsafe())
        cls.user.add_permission("publish_post", cls.other_institution.key.urlsafe())
        cls.user.add_permission("remove_member", cls.institution.key.urlsafe())
        cls.user.add_permission("remove_member", cls.other_institution.key.urlsafe())
        cls.user.put()
        cls.second_user.institutions = [cls.institution.key]
        cls.second_user.follows = [cls.institution.key]
        cls.second_user.add_permission("publish_post", cls.institution.key.urlsafe())
        cls.second_user.put()
        # create headers
        cls.headers = {'Institution-Authorization': cls.institution.key.urlsafe()}

    @patch('handlers.institution_members_handler.send_message_notification')
    @patch('handlers.institution_members_handler.RemoveMemberEmailSender.send_email')
    @patch('util.login_service.verify_token', return_value={'email': 'user@gmail.com'})
    def test_delete_with_notification(self, verify_token, send_email, send_message_notification):
        """Test if a notification is sent when the member is deleted."""
        # Set up the second_user
        self.second_user.institutions = [self.institution.key, self.other_institution.key]
        self.institution.members.append(self.second_user.key)
        self.other_institution.members.append(self.second_user.key)
        self.second_user.put()
        self.institution.put()
        self.other_institution.put()
        # Call the delete method
        self.testapp.delete(
            "/api/institutions/%s/members?removeMember=%s" 
            % (self.institution.key.urlsafe(), self.second_user.key.urlsafe()),
            headers=self.headers
        )

        message = {
            "from": {
                "photo_url": self.user.photo_url,
                "name": self.user.name,
                "institution_name": self.institution.name
            },
            "to": {
                "institution_name": ""
            },
            "current_institution": {
                "name": self.institution.name
            }
        }

        # Assert send_message_notification has been called
        send_message_notification.assert_called_with(
            receiver_key=self.second_user.key.urlsafe(),
            notification_type="DELETE_MEMBER",
            entity_key=self.institution.key.urlsafe(),
            message=json.dumps(message)
        )
        # Assert that send_email has been called
        send_email.assert_called()

    @patch('handlers.institution_members_handler.send_message_notification')
    @patch('handlers.institution_members_handler.RemoveMemberEmailSender.send_email')
    @patch('util.login_service.verify_token', return_value={'email': 'user@gmail.com'})
    def test_delete_with_email(self, verify_token, send_email, send_message_notification):
        """Test delete a member that belongs to only one institution."""
        # new user
        third_user = mocks.create_user()
        third_user.institutions = [self.institution.key]
        third_user.follows = [self.institution.key]
        third_user.put()
        # update institution
        self.institution.members.append(third_user.key)
        self.institution.followers.append(third_user.key)
        self.institution.put()
        # Call the delete method
        self.testapp.delete(
            "/api/institutions/%s/members?removeMember=%s" 
            % (self.institution.key.urlsafe(), third_user.key.urlsafe())
        )

        # assert send_message_notification was not called
        send_message_notification.assert_not_called()

        # Assert that send_email has been called
        send_email.assert_called()

    @patch('util.login_service.verify_token', return_value={'email': 'user@gmail.com'})
    def test_delete(self, verify_token):
        """Test delete method with an user that is not admin"""
        # Assert the initial conditions
        self.assertTrue(self.second_user.key in self.institution.members,
                        "Second_user should be member of institution")
        self.assertTrue(self.institution.key in self.second_user.institutions,
                        "Institution should be in institutions of second_user")
        # Call the delete method
        self.testapp.delete("/api/institutions/%s/members?removeMember=%s" %
                            (self.institution.key.urlsafe(), self.second_user.key.urlsafe()))

        # Update the institutions
        self.institution = self.institution.key.get()
        self.second_user = self.second_user.key.get()

        # Assert the final conditions
        self.assertTrue(self.user.key in self.institution.members,
                        "User should be member of institution")
        self.assertTrue(self.second_user.key not in self.institution.members,
                        "Second_user should be member of institution")
        self.assertTrue(
            self.institution.key not in self.second_user.institutions,
            "Institution shouldn't be in institutions of second_user")
        # In case that user has one institution, he becames inactive.
        self.assertEqual(self.second_user.state, "inactive",
                         "Second_user should be inactive")

        ### Admin try remove herself
        # Assert the initial conditions
        self.assertTrue(self.user.key in self.institution.members,
                        "User should be member of institution")
        self.assertTrue(self.institution.key in self.user.institutions,
                        "Institution should be in institutions of user")
        # Call the delete method
        with self.assertRaises(Exception) as ex:
            self.testapp.delete("/api/institutions/%s/members?removeMember=%s"
                                % (self.institution.key.urlsafe(), self.user.key.urlsafe()))

        exception_message = self.get_message_exception(ex.exception.message)
        self.assertEqual(
            "Error! Admin can not be removed",
            exception_message,
            "Expected error message is Error! Admin can not be removed")

        # Update the institutions
        self.institution = self.institution.key.get()
        self.user = self.user.key.get()

        # Assert the final conditions
        self.assertTrue(self.user.key in self.institution.members,
                        "User should be member of institution")
        self.assertTrue(self.institution.key in self.user.institutions,
                        "Institution shouldn't be in institutions of second_user")

    @patch('util.login_service.verify_token', return_value={'email': 'second_user@gmail.com'})
    def test_delete_not_admin(self, verify_token):
        """Test delete method with user not admin"""
        # Assert the initial conditions
        self.assertTrue(self.second_user.key in self.institution.members,
                        "Second_user should be member of institution")
        self.assertTrue(self.institution.key in self.second_user.institutions,
                        "Institution should be in institutions of second_user")
        # Call the delete method
        with self.assertRaises(Exception) as ex:
            self.testapp.delete("/api/institutions/%s/members?removeMember=%s" %
                                (self.institution.key.urlsafe(), self.second_user.key.urlsafe()))

        exception_message = self.get_message_exception(ex.exception.message)

        self.assertEqual(
            "Error! User is not allowed to remove member",
            exception_message,
            "Error! User is not allowed to remove member")

        # Update the institutions
        self.institution = self.institution.key.get()
        self.second_user = self.second_user.key.get()
        # Assert the final conditions
        self.assertTrue(self.second_user.key in self.institution.members,
                        "Second_user should be member of institution")
        self.assertTrue(self.institution.key in self.second_user.institutions,
                        "Institution should be in institutions of second_user")

    def tearDown(cls):
        """Deactivate the test."""
        cls.test.deactivate()
