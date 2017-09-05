# -*- coding: utf-8 -*-

from ..test_base import TestBase

from models.user import User


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
        initModels(cls)

    def test_add_permission(self):
        self.assertEquals(len(self.user.permissions), 0,
                        "Permission list size should be zero.")
        permission_type = "publish_post"
        entity_key = "key_of_post"
        self.user.add_permission(permission_type, entity_key)
        self.assertEquals(len(self.user.permissions), 1,
                        "Permission list size should be zero.")

        self.assertTrue(self.user.permissions[permission_type][entity_key],
                        "Permission publish_post should be granted to the user.")

    def test_remove_permission(self):
        self.assertEquals(len(self.user.permissions), 0,
                        "Permission list size should be zero.")
        permission_type = "publish_post"
        entity_key = "key_of_post"
        self.user.add_permission(permission_type, entity_key)
        self.assertEquals(len(self.user.permissions), 1,
                        "Permission list size should be zero.")
        self.assertTrue(self.user.permissions[permission_type][entity_key],
                        "Permission publish_post should be granted to the user.")
        self.user.remove_permission(permission_type, entity_key)

        self.assertEquals(len(self.user.permissions[permission_type]), 0,
                        "Permission list size should be zero.")

    def test_has_permission(self):
        self.assertEquals(len(self.user.permissions), 0,
                        "Permission list size should be zero.")
        permission_type = "publish_post"
        entity_key = "key_of_post"
        self.user.add_permission(permission_type, entity_key)
        self.assertEquals(len(self.user.permissions), 1,
                        "Permission list size should be zero.")

        self.assertTrue(self.user.permissions[permission_type][entity_key],
                        "Permission publish_post should be granted to the user.")

        has_permission = self.user.has_permission(permission_type, entity_key)

        self.assertTrue(has_permission,
                "User should be granted with publish_post permission on post %s" % entity_key)

    def test_dont_have_permission(self):
        self.assertEquals(len(self.user.permissions), 0,
                        "Permission list size should be zero.")
        permission_type = "publish_post"
        entity_key = "key_of_post"

        has_permission = self.user.has_permission(permission_type, entity_key)

        self.assertFalse(has_permission,
                "User should not be granted with publish_post permission on post %s" % entity_key)


def initModels(cls):
    """Init the models."""
    # new User
    cls.user = User()
    cls.user.name = 'User'
    cls.user.cpf = '089.675.908-90'
    cls.user.email = 'user@gmail.com'
    cls.user.institutions = []
    cls.user.follows = []
    cls.user.institutions_admin = []
    cls.user.notifications = []
    cls.user.posts = []
    cls.user.permissions = {}
