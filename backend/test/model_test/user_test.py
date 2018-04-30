# -*- coding: utf-8 -*-

from ..test_base import TestBase

from models import User

from .. import mocks

class UserTest(TestBase):
    """Test the user model class."""

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        cls.test = cls.testbed.Testbed()
        cls.test.activate()
        cls.policy = cls.datastore.PseudoRandomHRConsistencyPolicy(
            probability=1)
        cls.test.init_datastore_v3_stub(consistency_policy=cls.policy)
        cls.test.init_memcache_stub()

        # create user
        cls.user = mocks.create_user('user@gmail.com')
        cls.user.change_state('active')
        # create institution
        cls.institution = mocks.create_institution('Inst')
        cls.institution.admin = cls.user.key
        cls.institution.follow(cls.user.key)
        cls.institution.add_member(cls.user)
        cls.institution.change_state('active')
        # create other institution
        cls.other_inst = mocks.create_institution('Other_inst')
        # update user
        cls.user.institutions.append(cls.institution.key)
        cls.user.add_institution_admin(cls.institution.key)
        cls.user.follow(cls.institution.key)

    def tearDown(cls):
        """Deactivate the test."""
        cls.test.deactivate()

    def test_follow(self):
        self.assertEqual(len(self.user.follows), 1,
                          "User should follow only one institution.")
        self.user.follow(self.other_inst.key)
        self.assertEqual(len(self.user.follows), 2,
                           "User should follow two institutions after follow other_inst.")

    def test_unfollow(self):
        self.user.follow(self.other_inst.key)
        self.assertEqual(len(self.user.follows), 2,
                           "User should follow two institutions after follow other_inst.")
        self.user.unfollow(self.other_inst.key)
        self.assertEqual(len(self.user.follows), 1,
                            "User should follow only one institution after unfollow other_inst.")

    def test_add_institution(self):
        self.assertTrue(self.other_inst.key not in self.user.institutions,
                            "User should not be a member of other_inst.")
        self.user.add_institution(self.other_inst.key)
        self.assertTrue(self.user.permissions["publish_post"][self.other_inst.key.urlsafe()],
                            "User should has permission to publish post.")
        self.assertTrue(self.user.permissions["publish_survey"][self.other_inst.key.urlsafe()],
                            "User should has permission to publish survey.")

    def test_remove_institution(self):
        self.user.add_institution(self.other_inst.key)
        self.user.follow(self.other_inst.key)
        self.assertTrue(self.other_inst.key in self.user.institutions,
                            "User should be a member of other_inst.")
        self.assertTrue(self.user.permissions["publish_post"][self.other_inst.key.urlsafe()],
                            "User should has permission to publish post.")
        self.assertTrue(self.user.permissions["publish_survey"][self.other_inst.key.urlsafe()],
                            "User should has permission to publish survey.")
        self.user.remove_institution(self.other_inst.key)
        self.assertFalse(self.user.has_permission("publish_post", self.other_inst.key.urlsafe()),
                            "User should not has permission to publish post.")
        self.assertFalse(self.user.has_permission("publish_survey", self.other_inst.key.urlsafe()),
                            "User should not has permission to publish survey.")

    def test_add_permission(self):
        self.assertEquals(len(self.user.permissions), 0,
                          "Permission list size should be zero.")
        permission_type = "publish_post"
        entity_key = "key_of_post"
        self.user.add_permission(permission_type, entity_key)
        self.assertEquals(len(self.user.permissions), 1,
                          "Permission list size should be zero.")

        self.assertTrue(
            self.user.permissions[permission_type][entity_key],
            "Permission publish_post should be granted to the user."
        )

    def test_remove_permission(self):
        self.assertEquals(
            len(self.user.permissions),
            0, "Permission list size should be zero.")
        permission_type = "publish_post"
        entity_key = "key_of_post"
        self.user.add_permission(permission_type, entity_key)
        self.assertEquals(
            len(self.user.permissions), 1,
            "Permission list size should be zero.")
        self.assertTrue(
            self.user.permissions[permission_type][entity_key],
            "Permission publish_post should be granted to the user.")
        self.user.remove_permission(permission_type, entity_key)

        self.assertEquals(
            len(self.user.permissions[permission_type]),
            0, "Permission list size should be zero.")

    def test_has_permission(self):
        self.assertEquals(
            len(self.user.permissions),
            0, "Permission list size should be zero.")
        permission_type = "publish_post"
        entity_key = "key_of_post"
        self.user.add_permission(permission_type, entity_key)
        self.assertEquals(
            len(self.user.permissions),
            1, "Permission list size should be zero.")

        self.assertTrue(
            self.user.permissions[permission_type][entity_key],
            "Permission publish_post should be granted to the user.")

        has_permission = self.user.check_permission(permission_type,"User is not allowed to do this operation", entity_key)

        self.assertTrue(
            has_permission,
            "User should be granted with publish_post permission on post %s"
            % entity_key)

    def test_dont_have_permission(self):
        self.assertEquals(
            len(self.user.permissions),
            0, "Permission list size should be zero.")
        permission_type = "publish_post"
        entity_key = "key_of_post"

        with self.assertRaises(Exception) as ex:
            self.user.check_permission(permission_type, "User is not allowed to do this operation", entity_key)

        exception_message = ex.exception.message
        
        self.assertEqual(
            "User is not allowed to do this operation",
            exception_message,
            "User is not allowed to do this operation")
