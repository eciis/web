# -*- coding: utf-8 -*-
"""Post handler test."""

from test_base_handler import TestBaseHandler
from models.invite_institution import InviteInstitution
from models.user import User
from models.institution import Institution
from handlers.institution_handler import InstitutionHandler

import mock
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
            [("/api/institutions/(.*)/invites/(.*)", InstitutionHandler),
             ("/api/institutions/(.*)", InstitutionHandler),
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)
        initModels(cls)

    @patch('utils.verify_token', return_value={'email': 'user@example.com'})
    def test_patch(self, verify_token):
        """Test the post_handler's patch method."""
        # Call the patch method and assert that  it raises an exception
        self.testapp.patch_json("/api/institutions/%s"
                                % (self.first_inst.key.urlsafe()),
                                [{"op": "replace", "path": "/name",
                                    "value": "Nova Inst update"}]
                                )

        self.inst_create = self.first_inst.key.get()
        self.assertEqual(self.inst_create.name, "Nova Inst update",
                         "The institution name expected was Nova Inst update")

        # Pretend a new authentication
        verify_token.return_value = {'email': 'other_user@example.com'}

        # Check if raise Exception when the user who send patch is not the admin
        with self.assertRaises(Exception) as raises_context:
            self.testapp.patch_json("/api/institutions/%s"
                                    % (self.first_inst.key.urlsafe()),
                                    [{"op": "replace", "path": "/name",
                                      "value": "Nova Inst update"}]
                                    )

        message_exception = self.get_message_exception(str(raises_context.exception))

        self.assertEqual(
            message_exception,
            "Error! User is not allowed to edit institution",
            "Expected exception message must be equal to " +
            "Error! User is not allowed to edit institution")

    @patch('utils.verify_token', return_value={'email': 'other_user@example.com'})
    def test_post(self, verify_token):
        """Test the post_handler's post method."""
        # Call the patch method and assert that  it raises an exception
        data = {'sender_name': 'user name updated'}

        self.testapp.post_json("/api/institutions/%s/invites/%s"
                          % (self.stub.key.urlsafe(), self.invite.key.urlsafe()), data)

        self.inst_create = self.stub.key.get()
        self.assertEqual(self.inst_create.admin, self.other_user.key,
                         "The Admin of institution expected was Other")
        self.assertEqual(self.inst_create.followers, [self.other_user.key],
                         "The follower of institution expected was Other")
        self.assertEqual(self.inst_create.members, [self.other_user.key],
                         "The memeber of institution expected was Other")

        self.userUpdated = self.other_user.key.get()

        self.assertEqual(self.userUpdated.institutions_admin, [self.inst_create.key],
                         "The institution admin by Other expected was Inst create")

        self.assertEqual(self.userUpdated.state, "active",
                         "The state of Other expected was active")

        self.assertEqual(self.userUpdated.institution_profiles[0].office, "Administrador",
                         "The office of Other institution profile expected was Administrador")

        self.assertEqual(self.userUpdated.name, "user name updated",
                         "The name of Other  expected was user name updated")

        self.inviteUpdate = self.invite.key.get()

        self.assertEqual(self.inviteUpdate.status, "accepted",
                         "The status invite expected was accepted")

        # Pretend a new authentication
        verify_token.return_value = {'email': 'user@example.com'}

        # Check if raise Exception when the user who send patch is not the
        # invitee
        with self.assertRaises(Exception) as raises_context:
            self.testapp.post_json(
                "/api/institutions/%s/invites/%s" % (self.stub.key.urlsafe(), self.invite.key.urlsafe()),
                [{"op": "replace", "path": "/name", "value": "Nova Inst update"}]
            )

        message_exception = self.get_message_exception(str(raises_context.exception))
        self.assertEqual(
            message_exception,
            "Error! User is not invitee to create this Institution",
            "Expected exception message must be equal to " +
            "Error! User is not invitee to create this Institution")

    @patch('utils.verify_token', return_value={'email': 'user@example.com'})
    def test_get(self, verify_token):
        """Test the get method."""
        # Call the get method
        cert = self.testapp.get("/api/institutions/%s" %
                                self.first_inst.key.urlsafe()).json
        admin_first_inst = cert["admin"]

        # Verify if response is FIRST INST
        self.assertEqual(cert["name"], 'FIRST INST',
                         "The name expected was FIRST INST")
        self.assertEqual(cert["cnpj"], "18.104.068/0001-86",
                         "The cnpj expected was 18.104.068/0001-86")
        self.assertEqual(cert["email"], 'first_inst@example.com',
                         "The email expected was first_inst@example.com")
        self.assertEqual(len(cert["members"]), 2,
                         "The length of members should be 2")
        self.assertEqual(len(cert["followers"]), 2,
                         "The len of followers should be 2")
        self.assertEqual(cert["posts"], [],
                         "The posts should be empty")

        # Verify if admin is user
        self.assertEqual(admin_first_inst["name"], 'User',
                         "The name of admin should be User")
        self.assertEqual(admin_first_inst["key"], self.user.key.urlsafe(),
                         "The key of admin should be equal to key of obj user")

    @patch('utils.verify_token', return_value={'email': 'user@example.com'})
    def test_get_without_admin(self, verify_token):
        """Test the get method."""
        # Call the get method
        second_inst = self.testapp.get("/api/institutions/%s" %
                                 self.second_inst.key.urlsafe()).json
        admin_second_inst = second_inst["admin"]

        # Verify if response is SECOND INST
        self.assertEqual(second_inst["name"], 'SECOND INST',
                         "The name expected was SECOND INST")
        self.assertEqual(second_inst["cnpj"], "18.104.068/0000-86",
                         "The cnpj expected was 18.104.068/0000-86")
        self.assertEqual(second_inst["email"], 'second_inst@example.com',
                         "The email expected was second_inst@example.com")
        self.assertEqual(second_inst["posts"], [],
                         "The posts should be empty")

        # Verify if admin is None
        self.assertEqual(admin_second_inst, None,
                         "The admin should be None")

    @patch('utils.verify_token', return_value={'email': 'user@example.com'})
    def test_delete_without_remove_hierarchy(self, verify_token):
        """Test delete method."""
        # Set the cerbio's state to active
        self.first_inst.state = "active"
        self.first_inst.put()
        # Assert that the first_inst's state is active
        self.assertEqual(self.first_inst.state, "active",
                         "The state wasn't the expected one.")
        # Add the institution and the permission to user
        self.user.institutions = [self.first_inst.key]
        self.user.add_permission("publish_post", self.first_inst.key.urlsafe())
        self.user.put()
        # Assert that first_inst is in user.institutions.admin
        self.assertTrue(self.first_inst.key in self.user.institutions_admin)
        # Call the delete method
        self.testapp.delete("/api/institutions/%s?removeHierarchy=false" %
                            self.first_inst.key.urlsafe())
        # Update first_inst and user
        self.first_inst = self.first_inst.key.get()
        self.user = self.user.key.get()
        # Assert that the delete worked as expected
        self.assertEqual(self.first_inst.state, "inactive",
                         "The state wasn't the expected one.")
        self.assertTrue(self.first_inst.key not in self.user.institutions_admin)
        self.assertTrue(self.first_inst.key not in self.user.institutions)

    @patch('utils.verify_token', return_value={'email': 'user@example.com'})
    @mock.patch('service_entities.enqueue_task')
    def test_delete_with_remove_hierarchy(self, verify_token, mock_method):
        """Test delete removing hierarchy."""
        # Setting up the remove hierarchy test
        self.second_inst.state = "active"
        self.second_inst.admin = self.user.key
        self.second_inst.children_institutions = [self.third_inst.key]
        self.second_inst.put()
        self.third_inst.state = "active"
        self.third_inst.put()
        self.user.institutions.append(self.third_inst.key)
        self.user.institutions.append(self.second_inst.key)
        self.user.institutions_admin.append(self.second_inst.key)
        self.user.add_permission("publish_post", self.third_inst.key.urlsafe())
        self.user.add_permission("publish_post", self.second_inst.key.urlsafe())
        self.user.put()
        self.other_user.institutions_admin.append(self.third_inst.key)
        self.other_user.institutions.append(self.third_inst.key)
        self.other_user.institutions.append(self.second_inst.key)
        self.other_user.add_permission("publish_post", self.third_inst.key.urlsafe())
        self.other_user.add_permission("publish_post", self.second_inst.key.urlsafe())
        self.other_user.put()
        # Call the delete method
        self.testapp.delete("/api/institutions/%s?removeHierarchy=true" %
                            self.second_inst.key.urlsafe())
        # Assert that remove_institutions_from_users has been called
        self.assertTrue(mock_method.called)
        # Retrieve the entities
        self.second_inst = self.second_inst.key.get()
        self.user = self.user.key.get()
        self.third_inst = self.third_inst.key.get()
        # Assert that the delete worked as expected to the admin
        self.assertEqual(self.second_inst.state, "inactive",
                         "The state wasn't the expected one.")
        self.assertEqual(self.third_inst.state, "inactive",
                         "The state wasn't the expected one.")
        self.assertTrue(self.second_inst.key not in self.user.institutions_admin)
        self.assertTrue(self.second_inst.key not in self.user.institutions)
        self.assertTrue(self.third_inst.key not in self.user.institutions)

    @patch('utils.verify_token', return_value={'email': 'user@example.com'})
    def test_delete_child_institution(self, verify_token):
        """Test delete child institution."""
        self.user.institutions_admin.append(self.second_inst.key)
        self.user.institutions.append(self.third_inst.key)
        self.third_inst.state = "active"
        self.user.add_permission("publish_post", self.third_inst.key.urlsafe())
        self.user.add_permission("publish_post", self.second_inst.key.urlsafe())
        self.user.put()
        self.third_inst.put()
        self.testapp.delete("/api/institutions/%s?removeHierarchy=false" %
                            self.third_inst.key.urlsafe())
        self.third_inst = self.third_inst.key.get()
        self.assertTrue(self.third_inst.state == "inactive")

    @patch('utils.verify_token', return_value={'email': 'other_user@example.com'})
    def test_delete_child_institution_without_admin(self, verify_token):
        """Test delete child institution."""
        self.other_user.institutions.append(self.third_inst.key)
        self.first_inst.state = "active"
        self.other_user.add_permission("publish_post", self.first_inst.key.urlsafe())
        self.other_user.put()
        self.first_inst.put()
        with self.assertRaises(Exception):
            self.testapp.delete("/api/institutions/%s?removeHierarchy=false" %
                                self.first_inst.key.urlsafe())
        self.first_inst = self.first_inst.key.get()
        self.assertTrue(self.first_inst.state == "active")

    def tearDown(cls):
        """Deactivate the test."""
        cls.test.deactivate()


def initModels(cls):
    """Init the models."""
    # new User
    cls.user = User()
    cls.user.name = 'User'
    cls.user.cpf = '089.675.908-90'
    cls.user.email = ['user@example.com']
    cls.user.put()
    # new User Other
    cls.other_user = User()
    cls.other_user.name = 'Other'
    cls.other_user.cpf = '089.675.908-65'
    cls.other_user.email = ['other_user@example.com']
    cls.other_user.state = "pending"
    cls.other_user.put()
    # new Institution FIRST INST
    cls.first_inst = Institution()
    cls.first_inst.name = 'FIRST INST'
    cls.first_inst.acronym = 'FIRST INST'
    cls.first_inst.cnpj = '18.104.068/0001-86'
    cls.first_inst.legal_nature = 'public'
    cls.first_inst.actuation_area = ''
    cls.first_inst.description = 'Ensaio Químico'
    cls.first_inst.email = 'first_inst@example.com'
    cls.first_inst.phone_number = '(83) 3322 4455'
    cls.first_inst.members = [cls.user.key, cls.other_user.key]
    cls.first_inst.followers = [cls.user.key, cls.other_user.key]
    cls.first_inst.admin = cls.user.key
    cls.first_inst.put()
    cls.user.institutions_admin = [cls.first_inst.key]
    cls.user.add_permission("update_inst", cls.first_inst.key.urlsafe())
    cls.user.add_permission("remove_inst", cls.first_inst.key.urlsafe())
    cls.user.put()
    # new Institution SECOND INST
    cls.second_inst = Institution()
    cls.second_inst.name = 'SECOND INST'
    cls.second_inst.acronym = 'SECOND INST'
    cls.second_inst.cnpj = '18.104.068/0000-86'
    cls.second_inst.legal_nature = 'public'
    cls.second_inst.actuation_area = ''
    cls.second_inst.email = 'second_inst@example.com'
    cls.second_inst.phone_number = '(83) 3322 4455'
    cls.second_inst.members = [cls.user.key, cls.other_user.key]
    cls.second_inst.followers = [cls.user.key, cls.other_user.key]
    cls.second_inst.posts = []
    cls.second_inst.admin = None
    cls.second_inst.put()
    # Invite for Other create new inst
    cls.invite = InviteInstitution()
    cls.invite.invitee = 'other_user@example.com'
    cls.invite.admin_key = cls.user.key
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
    # new Institution ECIS
    cls.third_inst = Institution()
    cls.third_inst.name = 'THIRD INST'
    cls.third_inst.acronym = 'THIRD INST'
    cls.third_inst.cnpj = '18.104.068/0000-86'
    cls.third_inst.legal_nature = 'public'
    cls.third_inst.actuation_area = ''
    cls.third_inst.email = 'third_inst@example.com'
    cls.third_inst.phone_number = '(83) 3322 4455'
    cls.third_inst.members = [cls.user.key, cls.other_user.key]
    cls.third_inst.followers = [cls.user.key, cls.other_user.key]
    cls.third_inst.admin = cls.other_user.key
    cls.third_inst.parent_institution = cls.second_inst.key
    cls.third_inst.put()
    cls.second_inst.children_institutions.append(cls.third_inst.key)
    cls.second_inst.put()
