# -*- coding: utf-8 -*-
"""WorkerAuxMethodsTest."""

from ..test_base import TestBase
from .. import mocks
from worker import get_all_parent_admins, should_remove, is_not_admin
from worker import is_admin_of_parent_inst, filter_permissions_to_remove


class WorkerAuxMethodsTest(TestBase):
    """Test worker aux methods."""
    
    def test_should_remove(self):
        """Test the method should_remove."""

        user = mocks.create_user()
        first_inst = mocks.create_institution()
        second_inst = mocks.create_institution()
        third_inst = mocks.create_institution()

        user.add_institution(first_inst.key)
        user.add_institution_admin(first_inst.key)

        first_inst_urlsafe = first_inst.key.urlsafe()
        second_inst_urlsafe = second_inst.key.urlsafe()
        third_inst_urlsafe = third_inst.key.urlsafe()

        self.assertFalse(
            should_remove(user, first_inst_urlsafe, second_inst_urlsafe),
            "It should be false, because user is admin of first_inst")
        self.assertTrue(
            should_remove(user, second_inst_urlsafe, second_inst_urlsafe),
            """It should be true, because second_inst is the institution
            the user is transfering to another admin""")
        self.assertTrue(
            should_remove(user, third_inst_urlsafe, second_inst_urlsafe),
            "It should be true, because user is not admin of third_inst")


    def test_filter_permissions_to_remove(self):
        """Test method filter_permissions_to_remove."""

        def set_admin(user, inst):
            user.add_institution(inst.key)
            user.add_institution_admin(inst.key)
            inst.add_member(user)
            inst.set_admin(user.key)


        user = mocks.create_user()
        first_inst = mocks.create_institution()
        second_inst = mocks.create_institution()
        third_inst = mocks.create_institution()

        set_admin(user, first_inst)

        first_inst_urlsafe = first_inst.key.urlsafe()
        second_inst_urlsafe = second_inst.key.urlsafe()
        third_inst_urlsafe = third_inst.key.urlsafe()

        PERMISSIONS = ['PERMISSION_A', 'PERMISSION_B', 'PERMISSION_C']

        user.add_permissions(PERMISSIONS, first_inst_urlsafe)
        user.add_permissions(PERMISSIONS, second_inst_urlsafe)
        user.add_permissions(PERMISSIONS, third_inst_urlsafe)

        expected_permissions = {
            'publish_survey': [],
            'publish_post': []
        }

        permissions_to_remove = filter_permissions_to_remove(
            user, user.permissions,
            second_inst_urlsafe, should_remove
        )

        for permission_type in PERMISSIONS:
            expected_permissions[permission_type] = [second_inst_urlsafe, third_inst_urlsafe]
            permissions_to_remove[permission_type].sort()
            expected_permissions[permission_type].sort()
        
        # assert filtered permissions using should_remove method
        permissions_list = ['PERMISSION_A', 'PERMISSION_B', 'PERMISSION_C']
        for current_permission in permissions_list:
            for permission in permissions_to_remove[current_permission]:
                self.assertTrue(permission in expected_permissions[current_permission],
                            'The permission should be in the expected_permissions')

        # make user admin of second_inst
        set_admin(user, second_inst)
        
        permissions_to_remove = filter_permissions_to_remove(
            user, user.permissions,
            second_inst_urlsafe, is_not_admin
        )
        # update expected_permissions
        for permission_type in PERMISSIONS:
            expected_permissions[permission_type] = [third_inst_urlsafe]
        
        # assert filtered permissions using is_not_admin method
        self.assertEquals(
            permissions_to_remove, expected_permissions,
            "The permissions to remove should be of third_inst")


    def test_is_admin_of_parent_inst(self):
        """Test method is_admin_of_parent_inst."""

        first_user = mocks.create_user()
        second_user = mocks.create_user()
        third_user = mocks.create_user()

        first_inst = mocks.create_institution()
        second_inst = mocks.create_institution()
        third_inst = mocks.create_institution()
        fourth_inst = mocks.create_institution()

        first_inst.add_member(first_user)
        second_inst.add_member(second_user)
        third_inst.add_member(first_user)
        fourth_inst.add_member(third_user)

        first_inst.set_admin(first_user.key)
        second_inst.set_admin(second_user.key)
        third_inst.set_admin(first_user.key)
        fourth_inst.set_admin(third_user.key)

        first_user.add_institution(first_inst.key)
        first_user.add_institution(third_inst.key)
        second_user.add_institution(second_inst.key)
        third_user.add_institution(fourth_inst.key)

        first_user.add_institution_admin(first_inst.key)
        first_user.add_institution_admin(third_inst.key)
        second_user.add_institution_admin(second_inst.key)
        third_user.add_institution_admin(fourth_inst.key)

        # Hierarchy (top to bottom)
        #   first_inst -> second_inst -> third_inst -> fourth_inst
        #   (first_user)  (second_user)   (first_user)  (third_user)
        first_inst.add_child(second_inst.key)
        second_inst.add_child(third_inst.key)
        third_inst.add_child(fourth_inst.key)

        second_inst.set_parent(first_inst.key)
        third_inst.set_parent(second_inst.key)
        fourth_inst.set_parent(third_inst.key)

        self.assertTrue(
            is_admin_of_parent_inst(first_user, second_inst.key.urlsafe()),
            "It should be true, because first_user is also admin of first_inst")
        self.assertFalse(
            is_admin_of_parent_inst(second_user, first_inst.key.urlsafe()),
            """It should be False, because second_user is not admin of any
            institution above second_inst""")
        self.assertFalse(
            is_admin_of_parent_inst(third_user, third_inst.key.urlsafe()),
            """It should be False, because third_user is not admin of any
            institution above fourth_inst""")


    def test_is_not_admin(self):
        """Test the method is_not_admin."""

        first_user = mocks.create_user()
        second_user = mocks.create_user()

        first_inst = mocks.create_institution()
        second_inst = mocks.create_institution()

        first_user.add_institution(first_inst.key)
        second_user.add_institution(second_inst.key)

        first_user.add_institution_admin(first_inst.key)
        second_user.add_institution_admin(second_inst.key)

        first_inst_urlsafe = first_inst.key.urlsafe()
        second_inst_urlsafe = second_inst.key.urlsafe()

        self.assertFalse(
            is_not_admin(first_user, first_inst_urlsafe),
            """It should be False, because first_user is admin of first_inst""")
        self.assertTrue(
            is_not_admin(first_user, second_inst_urlsafe),
            """It should be True, because first_user is not admin of second_inst""")

        self.assertFalse(
            is_not_admin(second_user, second_inst_urlsafe),
            """It should be False, because second_user is admin of second_inst""")
        self.assertTrue(
            is_not_admin(second_user, first_inst_urlsafe),
            """It should be False, because second_user is not admin of first_inst""")


    def test_get_all_parent_admins(self):
        """Test the method get_all_parent_admins."""

        first_user = mocks.create_user()
        second_user = mocks.create_user()
        third_user = mocks.create_user()

        first_inst = mocks.create_institution()
        second_inst = mocks.create_institution()
        third_inst = mocks.create_institution()
        fourth_inst = mocks.create_institution()

        first_inst.add_member(first_user)
        second_inst.add_member(second_user)
        third_inst.add_member(first_user)
        fourth_inst.add_member(third_user)

        first_inst.set_admin(first_user.key)
        second_inst.set_admin(second_user.key)
        third_inst.set_admin(first_user.key)
        fourth_inst.set_admin(third_user.key)

        first_user.add_institution(first_inst.key)
        first_user.add_institution(third_inst.key)
        second_user.add_institution(second_inst.key)
        third_user.add_institution(fourth_inst.key)

        first_user.add_institution_admin(first_inst.key)
        first_user.add_institution_admin(third_inst.key)
        second_user.add_institution_admin(second_inst.key)
        third_user.add_institution_admin(fourth_inst.key)

        # Hierarchy (top to bottom)
        #   first_inst -> second_inst -> third_inst -> fourth_inst
        #   (first_user)  (second_user)   (first_user)  (third_user)
        first_inst.add_child(second_inst.key)
        second_inst.add_child(third_inst.key)
        third_inst.add_child(fourth_inst.key)

        second_inst.set_parent(first_inst.key)
        fourth_inst.set_parent(third_inst.key)

        admins = get_all_parent_admins(fourth_inst) 

        self.assertEquals(
            len(admins), 2,
            """It should be two, because only third_user and first_user
            have permissions over fourth_inst""")
        self.assertTrue(
            second_user not in admins,
            """It should be true, because the third_inst has not 
            confirmed the link with second_inst""")
        self.assertTrue(
            first_user in admins, 
            """It should be True, because first_user is admin of
            third_inst that is parent of fourth_inst""")
        self.assertTrue(
            third_user in admins,
            """It should be True, because third_user is admin of fourth_inst""")

        # now the link between second_inst and third_inst is confirmed
        third_inst.set_parent(second_inst.key)

        admins = get_all_parent_admins(fourth_inst, [])

        self.assertEquals(
            len(admins), 3,
            """It should be three, because first_user, second_user
            and third_user have permissions over fourth_inst""")
        self.assertTrue(
            first_user in admins,
            "It should be True, because first_user have permissions over fourth_inst")
        self.assertTrue(
            second_user in admins,
            "It should be True, because second_user have permissions over fourth_inst")
        self.assertTrue(
            third_user in admins,
            "It should be True, because third_user have permissions over fourth_inst")

