# -*- coding: utf-8 -*-
"""Remove admin permissions Hierarchy Handler test."""

from test_base_handler import TestBaseHandler
import permissions
import mocks
from worker import get_all_parent_admins


class WorkerAuxMethodsTest(TestBaseHandler):
    """Test Remove admin permission in institution hierarchy."""

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(WorkerAuxMethodsTest, cls).setUp()
        app = cls.webapp2.WSGIApplication(
             [], debug=True)
        cls.testapp = cls.webtest.TestApp(app)

    def get_all_parent_admins(self):
        """Test get_all_parent_admins method."""
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
        third_inst.children_institutions.append(fourth_inst.key)

        first_inst.put()
        second_inst.put()
        third_inst.put()
        fourth_inst.put()

        first_user.put()
        second_user.put()
        third_user.put()

        admins = get_all_parent_admins(fourth_inst, [])

        self.assertTrue(second_user not in admins)
        self.assertEquals([first_user, third_user], admins)

        second_inst.children_institutions.append(third_inst.key)

        admins = get_all_parent_admins(fourth_inst, [])

        self.assertTrue(second_user in admins)
        self.assertEquals([first_user, second_user, third_user], admins)
