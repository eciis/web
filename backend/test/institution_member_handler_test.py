# -*- coding: utf-8 -*-
"""Institution member handler test."""

from test_base_handler import TestBaseHandler
from models.user import User
from models.institution import Institution
from handlers.institution_members_handler import InstitutionMembersHandler
import mock
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
        initModels(cls)

    @patch('utils.verify_token', return_value={'email': 'user@gmail.com'})
    @mock.patch('service_messages.send_message_notification')
    def test_delete_with_notification(self, verify_token, mock_method):
        """Test if a notification is sent when the member is deleted."""
        # Set up the second_user
        self.second_user.institutions = [self.institution.key, self.other_institution.key]
        self.institution.members.append(self.second_user.key)
        self.other_institution.members.append(self.second_user.key)
        self.second_user.put()
        self.institution.put()
        self.other_institution.put()
        # Call the delete method
        self.testapp.delete("/api/institutions/%s/members?removeMember=%s" %
                            (self.institution.key.urlsafe(), self.second_user.key.urlsafe()))

        # Assert that mock_method has been called
        self.assertTrue(mock_method.called, "send_message_notification should've been called.")

    @patch('utils.verify_token', return_value={'email': 'user@gmail.com'})
    @mock.patch('service_messages.send_message_email')
    def test_delete_with_email(self, verify_token, mock_method):
        """Test if a notification is sent when the member is deleted."""
        # Call the delete method
        self.testapp.delete("/api/institutions/%s/members?removeMember=%s" %
                            (self.institution.key.urlsafe(), self.second_user.key.urlsafe()))

        # Assert that mock_method has been called
        self.assertTrue(mock_method.called, "send_message_email should've been called.")

    @patch('utils.verify_token', return_value={'email': 'user@gmail.com'})
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

    @patch('utils.verify_token', return_value={'email': 'second_user@gmail.com'})
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


def initModels(cls):
    """Init the models."""
    # new User user
    cls.user = User()
    cls.user.name = 'user'
    cls.user.state = "active"
    cls.user.email = ['user@gmail.com']
    cls.user.institutions = []
    cls.user.follows = []
    cls.user.institutions_admin = []
    cls.user.posts = []
    cls.user.put()
    # new User second_user
    cls.second_user = User()
    cls.second_user.name = 'second_user'
    cls.second_user.email = ['second_user@ccc.ufcg.edu.br']
    cls.second_user.state = "active"
    cls.second_user.institutions = []
    cls.second_user.follows = []
    cls.second_user.institutions_admin = []
    cls.second_user.posts = []
    cls.second_user.put()
    # new Institution institution
    cls.institution = Institution()
    cls.institution.name = 'institution'
    cls.institution.state = "active"
    cls.institution.email = 'institution@ufcg.edu.br'
    cls.institution.members = [cls.user.key, cls.second_user.key]
    cls.institution.followers = [cls.user.key, cls.second_user.key]
    cls.institution.posts = []
    cls.institution.admin = cls.user.key
    cls.institution.put()
    # another institution
    cls.other_institution = Institution()
    cls.other_institution.name = 'other_institution'
    cls.other_institution.state = 'active'
    cls.other_institution.email = 'other_institution@email.com'
    cls.other_institution.members = [cls.user.key]
    cls.other_institution.followers = [cls.user.key, cls.second_user.key]
    cls.other_institution.posts = []
    cls.other_institution.admin = cls.user.key
    cls.other_institution.put()

    cls.user.institutions = [cls.institution.key, cls.other_institution.key]
    cls.user.institutions_admin = [cls.institution.key, cls.other_institution.key]
    cls.user.add_permission("publish_post", cls.institution.key.urlsafe())
    cls.user.add_permission("publish_post", cls.other_institution.key.urlsafe())
    cls.user.add_permission("remove_member", cls.institution.key.urlsafe())
    cls.user.add_permission("remove_member", cls.other_institution.key.urlsafe())
    cls.user.put()
    cls.second_user.institutions = [cls.institution.key]
    cls.second_user.add_permission(
        "publish_post", cls.institution.key.urlsafe())
    cls.second_user.put()
