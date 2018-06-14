# -*- coding: utf-8 -*-
"""User institutions handler test."""

from .. import mocks

from ..test_base_handler import TestBaseHandler
from handlers.user_institutions_handler import UserInstitutionsHandler
from mock import patch


class UserInstitutionsHandlerTest(TestBaseHandler):
    """Test User Institutions Handler methods."""

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(UserInstitutionsHandlerTest, cls).setUp()
        app = cls.webapp2.WSGIApplication(
            [("/api/user/institutions/(.*)/institutional-operations", UserInstitutionsHandler)
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)
        initModels(cls)

    @patch('handlers.user_institutions_handler.LeaveInstitutionEmailSender.send_email')
    @patch('util.login_service.verify_token', return_value={'email': 'second_user@gmail.com'})
    def test_delete(self, verify_token, send_email):
        """Test delete."""
        # Assert the initial conditions
        self.assertTrue(self.second_user.key in self.institution.members)
        self.assertTrue(self.institution.key in self.second_user.institutions)

        # Call the delete method
        self.testapp.delete(
            "/api/user/institutions/%s/institutional-operations" % self.institution.key.urlsafe())

        # Retrieve the entities
        self.second_user = self.second_user.key.get()
        self.institution = self.institution.key.get()

        # Assert the expected conditions
        self.assertTrue(self.second_user.key not in self.institution.members)
        self.assertTrue(self.second_user.key in self.institution.followers)
        self.assertTrue(
            self.institution.key not in self.second_user.institutions)
        self.assertTrue(self.institution.key in self.second_user.follows)

        # Assert that send_email has been called
        send_email.assert_called()


def initModels(cls):
    """Init the tests' common models."""
    # new User user
    cls.user = mocks.create_user('user@gmail.com')
    # new User second_user
    cls.second_user = mocks.create_user('second_user@gmail.com')
    # new Institution institution
    cls.institution = mocks.create_institution()
    cls.institution.members = [cls.user.key, cls.second_user.key]
    cls.institution.followers = [cls.user.key, cls.second_user.key]
    cls.institution.admin = cls.user.key
    cls.institution.put()
    # update user
    cls.user.institutions = [cls.institution.key]
    cls.user.follows = [cls.institution.key]
    cls.user.institutions_admin = [cls.institution.key]
    cls.user.add_permission("publish_post", cls.institution.key.urlsafe())
    cls.user.add_permission("remove_member", cls.institution.key.urlsafe())
    cls.user.put()
    cls.second_user.institutions = [cls.institution.key]
    cls.second_user.follows = [cls.institution.key]
    cls.second_user.add_permission(
        "publish_post", cls.institution.key.urlsafe())
    cls.second_user.put()
    # create headers
    cls.headers = {
        'Institution-Authorization': cls.institution.key.urlsafe()}
