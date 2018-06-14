# -*- coding: utf-8 -*-
"""Remove admin permissions Hierarchy Handler test."""

from ..test_base_handler import TestBaseHandler, has_permissions
from worker import RemoveAdminPermissionsInInstitutionHierarchy
import permissions
from .. import mocks

REMOVE_ADMIN_PERMISSIONS_URI = '/api/queue/remove-admin-permissions'

class RemoveAdminPermissionsInInstitutionHierarchyTest(TestBaseHandler):
    """Test Remove admin permission in institution hierarchy."""
    
    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(RemoveAdminPermissionsInInstitutionHierarchyTest, cls).setUp()
        app = cls.webapp2.WSGIApplication(
            [
                (REMOVE_ADMIN_PERMISSIONS_URI, RemoveAdminPermissionsInInstitutionHierarchy)
            ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)

    def test_post(self):
        """Test the post method."""
        # Verify the members
        """Test remove admin permissions in institution hierarchy."""
        first_user = mocks.create_user()
        second_user = mocks.create_user()
        third_user = mocks.create_user()

        first_inst = mocks.create_institution()
        second_inst = mocks.create_institution()
        third_inst = mocks.create_institution()
        fourth_inst = mocks.create_institution()

        first_inst.add_member(first_user)
        first_inst.set_admin(first_user.key)
        third_inst.add_member(first_user)
        third_inst.set_admin(first_user.key)

        second_inst.add_member(second_user)
        second_inst.set_admin(second_user.key)
        
        fourth_inst.add_member(third_user)
        fourth_inst.set_admin(third_user.key)

        first_user.institutions_admin.append(first_inst.key)
        first_user.institutions_admin.append(third_inst.key)
        second_user.institutions_admin.append(second_inst.key)
        third_user.institutions_admin.append(fourth_inst.key)

        # Hierarchy
        #   first_inst -> second_inst -> third_inst -> fourth_inst
        #   (first_user)  (second_user)   (first_user)  (third_user)
        second_inst.parent_institution = first_inst.key
        third_inst.parent_institution = second_inst.key
        fourth_inst.parent_institution = third_inst.key

        first_inst.children_institutions.append(second_inst.key)
        second_inst.children_institutions.append(third_inst.key)
        third_inst.children_institutions.append(fourth_inst.key)

        first_user.add_permissions(
            permissions.DEFAULT_ADMIN_PERMISSIONS, first_inst.key.urlsafe())
        first_user.add_permissions(
            permissions.DEFAULT_ADMIN_PERMISSIONS, second_inst.key.urlsafe())
        first_user.add_permissions(
            permissions.DEFAULT_ADMIN_PERMISSIONS, third_inst.key.urlsafe())
        first_user.add_permissions(
            permissions.DEFAULT_ADMIN_PERMISSIONS, fourth_inst.key.urlsafe())

        first_inst.put()
        second_inst.put()
        third_inst.put()
        fourth_inst.put()

        first_user.put()
        second_user.put()
        third_user.put()

        self.assertTrue(has_permissions(
            first_user, first_inst.key.urlsafe(), permissions.DEFAULT_ADMIN_PERMISSIONS))
        self.assertTrue(has_permissions(
            first_user, second_inst.key.urlsafe(), permissions.DEFAULT_ADMIN_PERMISSIONS))
        self.assertTrue(has_permissions(
            first_user, third_inst.key.urlsafe(), permissions.DEFAULT_ADMIN_PERMISSIONS))
        self.assertTrue(has_permissions(
            first_user, fourth_inst.key.urlsafe(), permissions.DEFAULT_ADMIN_PERMISSIONS))

        first_user.institutions.append(first_inst.key)
        first_user.follows.append(first_inst.key)
        first_user.put()

        params = '?institution_key=%s&&parent_key=%s' % (second_inst.key.urlsafe(), first_inst.key.urlsafe())
        self.testapp.post(
            REMOVE_ADMIN_PERMISSIONS_URI + params
        )

        first_user = first_user.key.get()

        self.assertTrue(has_permissions(
            first_user, first_inst.key.urlsafe(), permissions.DEFAULT_ADMIN_PERMISSIONS))
        self.assertFalse(has_permissions(
            first_user, second_inst.key.urlsafe(), permissions.DEFAULT_ADMIN_PERMISSIONS))
        self.assertTrue(has_permissions(
            first_user, third_inst.key.urlsafe(), permissions.DEFAULT_ADMIN_PERMISSIONS))
        self.assertTrue(has_permissions(
            first_user, fourth_inst.key.urlsafe(), permissions.DEFAULT_ADMIN_PERMISSIONS))
    
    def test_no_permissions_removal(self):
        """Test the post method."""
        # Verify the members
        """Test remove admin permissions in institution hierarchy."""
        first_user = mocks.create_user()

        first_inst = mocks.create_institution()
        second_inst = mocks.create_institution()
        third_inst = mocks.create_institution()
        fourth_inst = mocks.create_institution()

        first_inst.add_member(first_user)
        first_inst.set_admin(first_user.key)
        second_inst.add_member(first_user)
        second_inst.set_admin(first_user.key)
        third_inst.add_member(first_user)
        third_inst.set_admin(first_user.key)
        fourth_inst.add_member(first_user)
        fourth_inst.set_admin(first_user.key)

        first_user.institutions_admin.append(first_inst.key)
        first_user.institutions_admin.append(second_inst.key)
        first_user.institutions_admin.append(third_inst.key)
        first_user.institutions_admin.append(fourth_inst.key)
        
        # Hierarchy
        #   first_inst -> second_inst -> third_inst -> fourth_inst
        #   (first_user)  (first_user)   (first_user)  (first_user)
        second_inst.parent_institution = first_inst.key
        third_inst.parent_institution = second_inst.key
        fourth_inst.parent_institution = third_inst.key

        first_inst.children_institutions.append(second_inst.key)
        second_inst.children_institutions.append(third_inst.key)
        third_inst.children_institutions.append(fourth_inst.key)

        first_user.add_permissions(
            permissions.DEFAULT_ADMIN_PERMISSIONS, first_inst.key.urlsafe())
        first_user.add_permissions(
            permissions.DEFAULT_ADMIN_PERMISSIONS, second_inst.key.urlsafe())
        first_user.add_permissions(
            permissions.DEFAULT_ADMIN_PERMISSIONS, third_inst.key.urlsafe())
        first_user.add_permissions(
            permissions.DEFAULT_ADMIN_PERMISSIONS, fourth_inst.key.urlsafe())

        first_inst.put()
        second_inst.put()
        third_inst.put()
        fourth_inst.put()

        first_user.put()

        self.assertTrue(has_permissions(
            first_user, first_inst.key.urlsafe(), permissions.DEFAULT_ADMIN_PERMISSIONS))
        self.assertTrue(has_permissions(
            first_user, second_inst.key.urlsafe(), permissions.DEFAULT_ADMIN_PERMISSIONS))
        self.assertTrue(has_permissions(
            first_user, third_inst.key.urlsafe(), permissions.DEFAULT_ADMIN_PERMISSIONS))
        self.assertTrue(has_permissions(
            first_user, fourth_inst.key.urlsafe(), permissions.DEFAULT_ADMIN_PERMISSIONS))

        first_user.institutions.append(first_inst.key)
        first_user.follows.append(first_inst.key)
        first_user.put()

        params = '?institution_key=%s&&parent_key=%s' % (
            third_inst.key.urlsafe(), second_inst.key.urlsafe())
        self.testapp.post(
            REMOVE_ADMIN_PERMISSIONS_URI + params
        )

        first_user = first_user.key.get()

        self.assertTrue(has_permissions(
            first_user, first_inst.key.urlsafe(), permissions.DEFAULT_ADMIN_PERMISSIONS))
        self.assertTrue(has_permissions(
            first_user, second_inst.key.urlsafe(), permissions.DEFAULT_ADMIN_PERMISSIONS))
        self.assertTrue(has_permissions(
            first_user, third_inst.key.urlsafe(), permissions.DEFAULT_ADMIN_PERMISSIONS))
        self.assertTrue(has_permissions(
            first_user, fourth_inst.key.urlsafe(), permissions.DEFAULT_ADMIN_PERMISSIONS))
    
    def test_with_permissions_removal_in_the_top_of_the_hierarchy(self):
        """Test the post method."""
        # Verify the members
        """Test remove admin permissions in institution hierarchy."""
        first_user = mocks.create_user()
        second_user = mocks.create_user()
        third_user = mocks.create_user()

        first_inst = mocks.create_institution()
        second_inst = mocks.create_institution()
        third_inst = mocks.create_institution()
        fourth_inst = mocks.create_institution()

        first_inst.add_member(first_user)
        first_inst.set_admin(first_user.key)
        third_inst.add_member(second_user)
        third_inst.set_admin(second_user.key)

        second_inst.add_member(second_user)
        second_inst.set_admin(second_user.key)

        fourth_inst.add_member(third_user)
        fourth_inst.set_admin(third_user.key)

        first_user.institutions_admin.append(first_inst.key)
        second_user.institutions_admin.append(second_inst.key)
        second_user.institutions_admin.append(third_inst.key)
        third_user.institutions_admin.append(fourth_inst.key)

        # Hierarchy
        #   first_inst -> second_inst -> third_inst -> fourth_inst
        #   (first_user)  (second_user)   (second_user)  (third_user)
        second_inst.parent_institution = first_inst.key
        fourth_inst.parent_institution = third_inst.key

        first_inst.children_institutions.append(second_inst.key)
        second_inst.children_institutions.append(third_inst.key)
        third_inst.children_institutions.append(fourth_inst.key)

        first_user.add_permissions(
            permissions.DEFAULT_ADMIN_PERMISSIONS, first_inst.key.urlsafe())
        first_user.add_permissions(
            permissions.DEFAULT_ADMIN_PERMISSIONS, second_inst.key.urlsafe())
        first_user.add_permissions(
            permissions.DEFAULT_ADMIN_PERMISSIONS, third_inst.key.urlsafe())
        first_user.add_permissions(
            permissions.DEFAULT_ADMIN_PERMISSIONS, fourth_inst.key.urlsafe())

        second_user.add_permissions(
            permissions.DEFAULT_ADMIN_PERMISSIONS, second_inst.key.urlsafe())
        second_user.add_permissions(
            permissions.DEFAULT_ADMIN_PERMISSIONS, third_inst.key.urlsafe())
        second_user.add_permissions(
            permissions.DEFAULT_ADMIN_PERMISSIONS, fourth_inst.key.urlsafe())

        third_user.add_permissions(
            permissions.DEFAULT_ADMIN_PERMISSIONS, fourth_inst.key.urlsafe())

        first_inst.put()
        second_inst.put()
        third_inst.put()
        fourth_inst.put()

        first_user.put()
        second_user.put()
        third_user.put()
        params = '?institution_key=%s&&parent_key=%s' % (
            third_inst.key.urlsafe(), second_inst.key.urlsafe())
        self.testapp.post(
            REMOVE_ADMIN_PERMISSIONS_URI + params
        )

        first_user = first_user.key.get()
        second_user = second_user.key.get()
        third_user = third_user.key.get()

        self.assertTrue(has_permissions(
            first_user, first_inst.key.urlsafe(), permissions.DEFAULT_ADMIN_PERMISSIONS))
        self.assertTrue(has_permissions(
            first_user, second_inst.key.urlsafe(), permissions.DEFAULT_ADMIN_PERMISSIONS))
        self.assertFalse(has_permissions(
            first_user, third_inst.key.urlsafe(), permissions.DEFAULT_ADMIN_PERMISSIONS))
        self.assertFalse(has_permissions(
            first_user, fourth_inst.key.urlsafe(), permissions.DEFAULT_ADMIN_PERMISSIONS))

        self.assertTrue(has_permissions(
            second_user, second_inst.key.urlsafe(), permissions.DEFAULT_ADMIN_PERMISSIONS))
        self.assertTrue(has_permissions(
            second_user, third_inst.key.urlsafe(), permissions.DEFAULT_ADMIN_PERMISSIONS))
        self.assertTrue(has_permissions(
            second_user, fourth_inst.key.urlsafe(), permissions.DEFAULT_ADMIN_PERMISSIONS))
        
        self.assertTrue(has_permissions(
            third_user, fourth_inst.key.urlsafe(), permissions.DEFAULT_ADMIN_PERMISSIONS))

    def test_simple_test(self):
        """Test the post method."""
        # Verify the members
        """Test remove admin permissions in institution hierarchy."""
        first_user = mocks.create_user()
        second_user = mocks.create_user()
        third_user = mocks.create_user()

        first_inst = mocks.create_institution()
        second_inst = mocks.create_institution()
        third_inst = mocks.create_institution()

        first_inst.add_member(first_user)
        first_inst.set_admin(first_user.key)
        third_inst.add_member(third_user)
        third_inst.set_admin(third_user.key)

        second_inst.add_member(second_user)
        second_inst.set_admin(second_user.key)

        first_user.institutions_admin.append(first_inst.key)
        second_user.institutions_admin.append(second_inst.key)
        third_user.institutions_admin.append(third_inst.key)

        # Hierarchy
        #   first_inst -> second_inst -> third_inst
        #   (first_user)  (second_user)   (third_user)
        second_inst.parent_institution = first_inst.key
        third_inst.parent_institution = second_inst.key

        first_inst.children_institutions.append(second_inst.key)
        second_inst.children_institutions.append(third_inst.key)

        first_user.add_permissions(
            permissions.DEFAULT_ADMIN_PERMISSIONS, first_inst.key.urlsafe())
        first_user.add_permissions(
            permissions.DEFAULT_ADMIN_PERMISSIONS, second_inst.key.urlsafe())
        first_user.add_permissions(
            permissions.DEFAULT_ADMIN_PERMISSIONS, third_inst.key.urlsafe())

        second_user.add_permissions(
            permissions.DEFAULT_ADMIN_PERMISSIONS, second_inst.key.urlsafe())
        second_user.add_permissions(
            permissions.DEFAULT_ADMIN_PERMISSIONS, third_inst.key.urlsafe())

        third_user.add_permissions(
            permissions.DEFAULT_ADMIN_PERMISSIONS, third_inst.key.urlsafe())

        first_inst.put()
        second_inst.put()
        third_inst.put()

        first_user.put()
        second_user.put()
        third_user.put()
        params = '?institution_key=%s&&parent_key=%s' % (
            second_inst.key.urlsafe(), first_inst.key.urlsafe())
        self.testapp.post(
            REMOVE_ADMIN_PERMISSIONS_URI + params
        )

        first_user = first_user.key.get()
        second_user = second_user.key.get()
        third_user = third_user.key.get()

        self.assertTrue(has_permissions(
            first_user, first_inst.key.urlsafe(), permissions.DEFAULT_ADMIN_PERMISSIONS))
        self.assertFalse(has_permissions(
            first_user, second_inst.key.urlsafe(), permissions.DEFAULT_ADMIN_PERMISSIONS))
        self.assertFalse(has_permissions(
            first_user, third_inst.key.urlsafe(), permissions.DEFAULT_ADMIN_PERMISSIONS))

        self.assertTrue(has_permissions(
            second_user, second_inst.key.urlsafe(), permissions.DEFAULT_ADMIN_PERMISSIONS))
        self.assertTrue(has_permissions(
            second_user, third_inst.key.urlsafe(), permissions.DEFAULT_ADMIN_PERMISSIONS))

        self.assertTrue(has_permissions(
            third_user, third_inst.key.urlsafe(), permissions.DEFAULT_ADMIN_PERMISSIONS))

    def test(self):
        """Test the post method."""
        # Verify the members
        """Test remove admin permissions in institution hierarchy."""
        first_user = mocks.create_user()
        second_user = mocks.create_user()

        first_inst = mocks.create_institution()
        second_inst = mocks.create_institution()
        third_inst = mocks.create_institution()
        fourth_inst = mocks.create_institution()

        first_inst.add_member(first_user)
        first_inst.set_admin(first_user.key)
        third_inst.add_member(second_user)
        third_inst.set_admin(second_user.key)

        second_inst.add_member(second_user)
        second_inst.set_admin(second_user.key)

        fourth_inst.add_member(first_user)
        fourth_inst.set_admin(first_user.key)

        first_user.institutions_admin.append(first_inst.key)
        second_user.institutions_admin.append(second_inst.key)
        second_user.institutions_admin.append(third_inst.key)
        first_user.institutions_admin.append(fourth_inst.key)

        # Hierarchy
        #   first_inst -> second_inst -> third_inst -> fourth_inst
        #   (first_user)  (second_user)   (second_user)  (first_user)
        second_inst.parent_institution = first_inst.key
        fourth_inst.parent_institution = third_inst.key

        first_inst.children_institutions.append(second_inst.key)
        second_inst.children_institutions.append(third_inst.key)
        third_inst.children_institutions.append(fourth_inst.key)

        first_user.add_permissions(
            permissions.DEFAULT_ADMIN_PERMISSIONS, first_inst.key.urlsafe())
        first_user.add_permissions(
            permissions.DEFAULT_ADMIN_PERMISSIONS, second_inst.key.urlsafe())
        first_user.add_permissions(
            permissions.DEFAULT_ADMIN_PERMISSIONS, third_inst.key.urlsafe())
        first_user.add_permissions(
            permissions.DEFAULT_ADMIN_PERMISSIONS, fourth_inst.key.urlsafe())

        second_user.add_permissions(
            permissions.DEFAULT_ADMIN_PERMISSIONS, second_inst.key.urlsafe())
        second_user.add_permissions(
            permissions.DEFAULT_ADMIN_PERMISSIONS, third_inst.key.urlsafe())
        second_user.add_permissions(
            permissions.DEFAULT_ADMIN_PERMISSIONS, fourth_inst.key.urlsafe())

        first_inst.put()
        second_inst.put()
        third_inst.put()
        fourth_inst.put()

        first_user.put()
        second_user.put()
        params = '?institution_key=%s&&parent_key=%s' % (
            third_inst.key.urlsafe(), second_inst.key.urlsafe())
        self.testapp.post(
            REMOVE_ADMIN_PERMISSIONS_URI + params
        )

        first_user = first_user.key.get()
        second_user = second_user.key.get()

        self.assertTrue(has_permissions(
            first_user, first_inst.key.urlsafe(), permissions.DEFAULT_ADMIN_PERMISSIONS))
        self.assertTrue(has_permissions(
            first_user, second_inst.key.urlsafe(), permissions.DEFAULT_ADMIN_PERMISSIONS))
        self.assertFalse(has_permissions(
            first_user, third_inst.key.urlsafe(), permissions.DEFAULT_ADMIN_PERMISSIONS))
        self.assertTrue(has_permissions(
            first_user, fourth_inst.key.urlsafe(), permissions.DEFAULT_ADMIN_PERMISSIONS))

        self.assertTrue(has_permissions(
            second_user, second_inst.key.urlsafe(), permissions.DEFAULT_ADMIN_PERMISSIONS))
        self.assertTrue(has_permissions(
            second_user, third_inst.key.urlsafe(), permissions.DEFAULT_ADMIN_PERMISSIONS))
        self.assertTrue(has_permissions(
            second_user, fourth_inst.key.urlsafe(), permissions.DEFAULT_ADMIN_PERMISSIONS))

    
    def test_to_keep_permissions_information(self):
        """apokdpos."""
        first_user = mocks.create_user()
        second_user = mocks.create_user()
        third_user = mocks.create_user()

        first_inst = mocks.create_institution()
        second_inst = mocks.create_institution()
        third_inst = mocks.create_institution()
        fourth_inst = mocks.create_institution()

        first_inst.add_member(first_user)
        first_inst.set_admin(first_user.key)
        third_inst.add_member(second_user)
        third_inst.set_admin(second_user.key)

        second_inst.add_member(third_user)
        second_inst.set_admin(third_user.key)

        fourth_inst.add_member(third_user)
        fourth_inst.set_admin(third_user.key)

        first_user.institutions_admin = [first_inst.key]
        third_user.institutions_admin.append(second_inst.key)
        second_user.institutions_admin.append(third_inst.key)
        third_user.institutions_admin.append(fourth_inst.key)

        # Hierarchy
        #   first_inst -> second_inst -> third_inst -> fourth_inst
        #   (first_user)  (third_user)   (second_user)  (third_user)
        second_inst.parent_institution = first_inst.key
        fourth_inst.parent_institution = third_inst.key

        first_inst.children_institutions.append(second_inst.key)
        second_inst.children_institutions.append(third_inst.key)
        third_inst.children_institutions.append(fourth_inst.key)

        first_user.add_permissions(
            permissions.DEFAULT_ADMIN_PERMISSIONS, first_inst.key.urlsafe())
        first_user.add_permissions(
            permissions.DEFAULT_ADMIN_PERMISSIONS, second_inst.key.urlsafe())
        first_user.add_permissions(
            permissions.DEFAULT_ADMIN_PERMISSIONS, third_inst.key.urlsafe())
        first_user.add_permissions(
            permissions.DEFAULT_ADMIN_PERMISSIONS, fourth_inst.key.urlsafe())

        second_user.add_permissions(
            permissions.DEFAULT_ADMIN_PERMISSIONS, third_inst.key.urlsafe())
        second_user.add_permissions(
            permissions.DEFAULT_ADMIN_PERMISSIONS, fourth_inst.key.urlsafe())
        
        third_user.add_permissions(
            permissions.DEFAULT_ADMIN_PERMISSIONS, second_inst.key.urlsafe())
        third_user.add_permissions(
            permissions.DEFAULT_ADMIN_PERMISSIONS, third_inst.key.urlsafe())
        third_user.add_permissions(
            permissions.DEFAULT_ADMIN_PERMISSIONS, fourth_inst.key.urlsafe())

        first_inst.put()
        second_inst.put()
        third_inst.put()
        fourth_inst.put()

        first_user.put()
        second_user.put()
        third_user.put()
        params = '?institution_key=%s&&parent_key=%s' % (
            third_inst.key.urlsafe(), second_inst.key.urlsafe())
        self.testapp.post(
            REMOVE_ADMIN_PERMISSIONS_URI + params
        )

        first_user = first_user.key.get()
        second_user = second_user.key.get()
        third_user = third_user.key.get()

        self.assertTrue(has_permissions(
            first_user, first_inst.key.urlsafe(), permissions.DEFAULT_ADMIN_PERMISSIONS))
        self.assertTrue(has_permissions(
            first_user, second_inst.key.urlsafe(), permissions.DEFAULT_ADMIN_PERMISSIONS))
        self.assertFalse(has_permissions(
            first_user, third_inst.key.urlsafe(), permissions.DEFAULT_ADMIN_PERMISSIONS))
        self.assertFalse(has_permissions(
            first_user, fourth_inst.key.urlsafe(), permissions.DEFAULT_ADMIN_PERMISSIONS))

        self.assertTrue(has_permissions(
            second_user, third_inst.key.urlsafe(), permissions.DEFAULT_ADMIN_PERMISSIONS))
        self.assertTrue(has_permissions(
            second_user, fourth_inst.key.urlsafe(), permissions.DEFAULT_ADMIN_PERMISSIONS))
        
        self.assertTrue(has_permissions(
            third_user, second_inst.key.urlsafe(), permissions.DEFAULT_ADMIN_PERMISSIONS))
        self.assertFalse(has_permissions(
            third_user, third_inst.key.urlsafe(), permissions.DEFAULT_ADMIN_PERMISSIONS))
        self.assertTrue(has_permissions(
            third_user, fourth_inst.key.urlsafe(), permissions.DEFAULT_ADMIN_PERMISSIONS))
