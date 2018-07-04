# -*- coding: utf-8 -*-
"""WorkerAuxMethodsTest."""

from ..test_base import TestBase
import permissions
from .. import mocks
from worker import get_all_parent_admins


class WorkerAuxMethodsTest(TestBase):
    """Test worker aux methods."""
    
    def test_get_all_parent_admins(self):
        """Test get_all_parent_admins method."""
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

        self.assertEquals(len(admins), 2)
        # should be true, because the third_inst has not
        # confirmed the link with second_inst
        self.assertTrue(second_user not in admins)
        self.assertTrue(first_user in admins)
        self.assertTrue(third_user in admins)

        # now the link between second_inst and third_inst is confirmed
        third_inst.set_parent(second_inst.key)

        admins = get_all_parent_admins(fourth_inst, [])

        self.assertEquals(len(admins), 3)
        self.assertTrue(first_user in admins)
        self.assertTrue(second_user in admins)
        self.assertTrue(third_user in admins)
