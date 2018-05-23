# -*- coding: utf-8 -*-

from ..test_base import TestBase

from models import Institution
from models import RequestInstitutionParent
from permissions import DEFAULT_ADMIN_PERMISSIONS

from .. import mocks


class InstitutionTest(TestBase):
    """Test the institution model."""

    @classmethod
    def setUp(cls):
        """Provide base for tests."""
        cls.test = cls.testbed.Testbed()
        cls.test.activate()
        cls.policy = cls.datastore.PseudoRandomHRConsistencyPolicy(
            probability=1)
        cls.test.init_datastore_v3_stub(consistency_policy=cls.policy)
        cls.test.init_memcache_stub()

        """Init models"""
        cls.admin = mocks.create_user()
        cls.user = mocks.create_user()
        cls.institution = mocks.create_institution()
        cls.institution.add_member(cls.admin)
        cls.institution.set_admin(cls.admin.key)
        cls.admin.add_institution(cls.institution.key)
        cls.admin.add_institution_admin(cls.institution.key)

    def tearDown(cls):
        """Deactivate the test."""
        cls.test.deactivate()

    def test_add_child(self):
        
        self.assertEquals(
            self.institution.children_institutions, [],
            "Instituion should not have children"
        )

        new_inst = mocks.create_institution()
        self.institution.add_child(new_inst.key)
        self.institution = self.institution.key.get()

        self.assertEquals(
            self.institution.children_institutions, [new_inst.key],
            "Instituion should have new_inst as child"
        )

        self.institution.add_child(new_inst.key)
        
        self.assertEquals(
            self.institution.children_institutions, [new_inst.key],
            "Institution should not have repeated children"
        )    
        
    def test_remove_child(self):

        new_inst = mocks.create_institution()
        self.institution.add_child(new_inst.key)
        self.institution = self.institution.key.get()

        self.assertEquals(
            self.institution.children_institutions, [new_inst.key],
            "Instituion should have new_inst as child"
        )

        self.institution.remove_child(new_inst.key)

        self.assertEquals(
            self.institution.children_institutions, [],
            "Instituion should not have children"
        )

    def test_follow(self):
        # case in which the user is not a follower
        self.assertEquals(self.institution.followers, [],
            "Institution followers should be empty"
        )
        self.institution.follow(self.user.key)
        self.assertEquals(self.institution.followers, [self.user.key],
            "Institution followers should have user key"
        )

        # case in which the user is already a follower
        self.institution.follow(self.user.key)
        self.assertEquals(self.institution.followers, [self.user.key],
            "Institution followers should not have the same user key more than once"
        )
        

    def test_unfollow(self):
        # case in which the user is not a member
        self.institution.follow(self.user.key)
        self.assertEquals(self.institution.followers, [self.user.key],
            "Institution followers should have user key"
        )
        self.institution.unfollow(self.user.key)
        self.assertEquals(self.institution.followers, [],
            "Institution followers should be empty"
        )

        # case in which the user is a member
        self.institution.add_member(self.user)
        self.institution.follow(self.user.key)
        self.assertTrue(self.user.key in self.institution.members,
            "User should be an institution member"
        )
        self.assertTrue(self.user.key in self.institution.followers,
            "Institution followers should have user key"
        )
        self.institution.unfollow(self.user.key)
        self.assertTrue(self.user.key in self.institution.followers,
            "The user should not have been removed from followers"
        )

    def test_add_member(self):
        # verify if user is not a member of the institution
        self.assertTrue(self.user.key not in self.institution.members,
            "The user should not be a member of the institution")

        # adding member into the institution
        self.institution.add_member(self.user)

        # verify if user is a member of the institution
        self.assertTrue(self.user.key in self.institution.members,
            "The user should be a member of the institution")

        # verify the length of institution members list
        self.assertTrue(len(self.institution.members) == 2,
            "Should has two members into the institution")

        # adding a existing member into the institution
        self.institution.add_member(self.user)

        # verify the length of institution members list again
        self.assertTrue(len(self.institution.members) == 2,
            "Should still has two members into the institution")

    def test_remove_member(self):
        # test remove the admin of institution
        with self.assertRaises(Exception) as ex:
            self.institution.remove_member(self.admin)

        message = str(ex.exception)
        self.assertEqual(
            message,
            'Admin can not be removed',
            "Expected message must be equal to 'Admin can not be removed'")

        # add a member into the institution
        self.institution.add_member(self.user)

        # verify if user is a member of the institution
        self.assertTrue(self.user.key in self.institution.members,
            "The user should be a member of the institution")

        # remove member
        self.institution.remove_member(self.user)

        # verify if user is not a member of institution
        self.assertTrue(self.user.key not in self.institution.members,
            "The user should not be a member of the institution")

    def test_add_post(self):
        post = mocks.create_post(self.admin.key, self.institution.key)

        self.assertTrue(post.key not in self.institution.posts,
            "The post should not be in the institutions posts")

        self.institution.add_post(post)

        self.assertTrue(post.key in self.institution.posts,
            "The post should be in the institution posts")

    def test_create_parent_connection(self):
        child_inst = mocks.create_institution()
        invite = mocks.create_invite(self.user, child_inst.key, 'INSTITUTION')

        self.assertTrue(child_inst.key not in self.institution.children_institutions,
            "Institution should not has a children institution")

        self.assertTrue(child_inst.parent_institution is None,
            "child_inst should not has parent institution")

        self.institution.create_parent_connection(invite)

        self.assertTrue(child_inst.key in self.institution.children_institutions,
            "Institution should has a children institution")

    def test_create_children_connection(self):
        parent_inst = mocks.create_institution()
        invite = mocks.create_invite(self.user, parent_inst.key, 'INSTITUTION')

        self.assertTrue(self.institution.key not in parent_inst.children_institutions,
            "parent_inst should not be has a children institution")

        self.assertTrue(self.institution.parent_institution is None,
            "institution should not has parent institution")

        self.institution.create_children_connection(invite)

        self.assertEqual(self.institution.parent_institution, parent_inst.key,
            "Institution should has a children institution")

    def test_remove_institution(self):
        self.admin.add_permission('remove_inst', self.institution.key.urlsafe())
        self.institution.change_state('active')

        self.assertEqual(self.institution.state, 'active',
            "The state of institution should be active")

        self.institution.remove_institution('false', self.admin)

        self.assertEqual(self.institution.state, 'inactive',
            "The state of institution should be inactive")


    def test_remove_link(self):
        # case 1: remove parent
        parent_inst = mocks.create_institution()
        invite = mocks.create_invite(self.user, parent_inst.key, 'INSTITUTION')

        self.assertTrue(self.institution.key not in parent_inst.children_institutions,
            "parent_inst should not be has a children institution")

        self.assertTrue(self.institution.parent_institution is None,
            "institution should not has parent institution")

        self.institution.create_children_connection(invite)

        self.assertEqual(self.institution.parent_institution, parent_inst.key,
            "Institution should has a children institution")

        self.institution.remove_link(parent_inst, "true")

        self.assertTrue(self.institution.parent_institution is None,
            "institution should not has parent institution")

        # case 2: remove children
        child_inst = mocks.create_institution()
        invite = mocks.create_invite(self.user, child_inst.key, 'INSTITUTION')

        self.assertTrue(child_inst.key not in self.institution.children_institutions,
            "Institution should not has a children institution")

        self.assertTrue(child_inst.parent_institution is None,
            "child_inst should not has parent institution")

        self.institution.create_parent_connection(invite)

        self.assertTrue(child_inst.key in self.institution.children_institutions,
            "Institution should has a children institution")

        self.institution.remove_link(child_inst, "false")

        self.assertTrue(child_inst.key not in self.institution.children_institutions,
            "Institution should not has a children institution")

    def test_get_hierarchy_admin_permissions(self):
        
        def generate_permissions(institution_key_url, permissions={}):
            for permission in DEFAULT_ADMIN_PERMISSIONS:
                if permission in permissions:
                    permissions[permission].update({institution_key_url: True})
                else:
                    permissions.update({permission: {institution_key_url: True}})
            return permissions

        # Case 1: Get all permission and the admin has just one institution
        # Institution(admin) -> x
        expected_permissions = generate_permissions(self.institution.key.urlsafe(), {})
        actual_permissions = self.institution.get_hierarchy_admin_permissions()
        # verifies the institution admin just have permissions to institution
        self.assertEquals(actual_permissions, expected_permissions,
            "The admin does not have the expected permissions"
        )

        # Case 2: Get all permission and the admin has one institution and 
        # one child that he is not admin  
        # Institution(admin) -> child_a(other_admin) -> x
        child_a = mocks.generate_child_to_parent(self.institution)
        self.institution = self.institution.key.get()
        expected_permissions = generate_permissions(self.institution.key.urlsafe(), {})
        expected_permissions = generate_permissions(child_a.key.urlsafe(), expected_permissions)
        actual_permissions = self.institution.get_hierarchy_admin_permissions()
        # verifies inst admin also have permissions to child_a
        self.assertEquals(actual_permissions, expected_permissions,
            "The admin does not have the expected permissions"
        )

        # Case 3: Get all permission and the admin has one institution and 
        # one child that he is not admin  
        # Institution(admin) -> child_a(other_admin) -> child_b(admin) -> child_c(other_admin) -> x
        child_b = mocks.generate_child_to_parent(child_a, self.admin)
        child_c = mocks.generate_child_to_parent(child_b, child_a.admin.get())
        self.institution = self.institution.key.get()
        expected_permissions = generate_permissions(self.institution.key.urlsafe(), {})
        expected_permissions = generate_permissions(child_a.key.urlsafe(), expected_permissions)
        expected_permissions = generate_permissions(child_b.key.urlsafe(), expected_permissions)
        expected_permissions = generate_permissions(child_c.key.urlsafe(), expected_permissions)
        actual_permissions = self.institution.get_hierarchy_admin_permissions()
        # verifies institution admin also have permissions to child_a
        self.assertEquals(actual_permissions, expected_permissions,
            "The admin does not have the expected permissions"
        )    

        # Case 4: Get all the hierarchy permissions, except the ones from the part of the hierarchy
        # where the highest child admin is the same as the institution admin
        # Institution(admin) -> child_a(other_admin) -> child_b(admin) -> child_c(other_admin) -> x
        self.assertEquals(self.institution.admin, child_b.admin,
            "The institution admin should be equal to child_b admin"
        )
        expected_permissions = generate_permissions(self.institution.key.urlsafe(), {})
        expected_permissions = generate_permissions(child_a.key.urlsafe(), expected_permissions)
        actual_permissions = self.institution.get_hierarchy_admin_permissions(get_all=False, admin_key=self.admin.key)
        # verifies institution admin also have permissions to child_a
        self.assertEquals(actual_permissions, expected_permissions,
            "The admin does not have the expected permissions"
        )

    def test_has_connection_between(self):
        #  create hierarchy
        # institution -> child_a -> child_b -> child_c
        child_a = mocks.generate_child_to_parent(self.institution)
        child_b = mocks.generate_child_to_parent(child_a)
        child_c = mocks.generate_child_to_parent(child_b)
        independent_instituion = mocks.create_institution()

        # update institution
        self.institution = self.institution.key.get() 

        # verifies the hierarchy
        self.assertEquals(
            self.institution.parent_institution, None,
            "institution should not have a parent"
        )
        self.assertEquals(
            child_a.parent_institution, self.institution.key,
            "institution should be parent of child_a"
        )
        self.assertEquals(
            child_b.parent_institution, child_a.key,
            "child_a should be parent of child_b"
        )
        self.assertEquals(
            child_c.parent_institution, child_b.key,
            "child_b should be parent of child_c"
        )
        self.assertEquals(
            independent_instituion.parent_institution, None,
            "independent_institution should not have a parent"
        )
        self.assertEquals(
            independent_instituion.children_institutions, [],
            "independent_institution should not have children"
        )

        # verifies the connections
        # Case 1: institutions directly connected
        self.assertTrue(
            Institution.has_connection_between(child_a.key, self.institution.key),
            "The connection between child_a and institution should be true"
        )
        # Case 2: institutions indirectly connected
        self.assertTrue(
            Institution.has_connection_between(child_b.key, self.institution.key),
            "The connection between child_b and institution should be true"
        )
        self.assertTrue(
            Institution.has_connection_between(child_c.key, self.institution.key),
            "The connection between child_c and institution should be true"
        )
        # Case 3: institutions disconnected
        self.assertFalse(
            Institution.has_connection_between(independent_instituion.key, self.institution.key),
            "The connection between independent_instituion and institution should be false"
        )
        self.assertFalse(
            Institution.has_connection_between(self.institution.key, independent_instituion.key),
            "The connection between institution and independent_instituion should be false"
        )

    def test_verify_connection(self):
        """Test verify_connection method."""
        child_inst = mocks.create_institution()
        parent_inst = mocks.create_institution()

        #There is no link
        self.assertFalse(child_inst.verify_connection(parent_inst))
        self.assertFalse(parent_inst.verify_connection(child_inst))
        
        child_inst.parent_institution = parent_inst.key

        #Just the child is linked to the parent
        self.assertFalse(child_inst.verify_connection(parent_inst))
        self.assertFalse(parent_inst.verify_connection(child_inst))

        parent_inst.children_institutions.append(child_inst.key)
        
        #There is link in two directions
        self.assertTrue(child_inst.verify_connection(parent_inst))
        self.assertTrue(parent_inst.verify_connection(child_inst))

        child_inst.parent_institution = None

        #Just the parent is linked to the child
        self.assertFalse(child_inst.verify_connection(parent_inst))
        self.assertFalse(parent_inst.verify_connection(child_inst))
