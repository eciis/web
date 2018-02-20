# -*- coding: utf-8 -*-
"""Institution collection handler test."""
import operator
from test_base_handler import TestBaseHandler
from models.invite_institution import InviteInstitution
from models.user import User
from models.institution import Institution
from handlers.institution_collection_handler import InstitutionCollectionHandler
from worker import AddAdminPermissionsInInstitutionHierarchy
from worker import RemoveAdminPermissionsInInstitutionHierarchy

from mock import patch
import mocks


class InstitutionCollectionHandlerTest(TestBaseHandler):
    """Test the institution_collecion_handler class."""

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(InstitutionCollectionHandlerTest, cls).setUp()
        methods = set(cls.webapp2.WSGIApplication.allowed_methods)
        methods.add('PATCH')
        cls.webapp2.WSGIApplication.allowed_methods = frozenset(methods)
        app = cls.webapp2.WSGIApplication(
            [("/api/institutions", InstitutionCollectionHandler),
             ("/api/queue/add-admin-permissions", AddAdminPermissionsInInstitutionHierarchy),
             ('/api/queue/remove-admin-permissions', RemoveAdminPermissionsInInstitutionHierarchy)
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)
        
        # create models
        # new User
        cls.user = mocks.create_user('user@example.com')
        cls.user.name = "User"
        # new User Other
        cls.other_user = mocks.create_user('other_user@example.com')
        cls.other_user.state = "pending"
        cls.other_user.put()
        # new Institution FIRST INST
        cls.first_inst = mocks.create_institution()
        cls.first_inst.name = 'FIRST INST'
        cls.first_inst.acronym = 'FIRST INST'
        cls.first_inst.cnpj = '18.104.068/0001-86'
        cls.first_inst.email = 'first_inst@example.com'
        cls.first_inst.members = [cls.user.key, cls.other_user.key]
        cls.first_inst.followers = [cls.user.key, cls.other_user.key]
        cls.first_inst.admin = cls.user.key
        cls.first_inst.put()
        cls.user.institutions_admin = [cls.first_inst.key]
        cls.user.institutions = [cls.first_inst.key]
        cls.user.add_permission("update_inst", cls.first_inst.key.urlsafe())
        cls.user.add_permission("remove_inst", cls.first_inst.key.urlsafe())
        cls.user.put()
        # new Institution SECOND INST
        cls.second_inst = mocks.create_institution()
        cls.second_inst.name = 'SECOND INST'
        cls.second_inst.acronym = 'SECOND INST'
        cls.second_inst.cnpj = '18.104.068/0000-86'
        cls.second_inst.email = 'second_inst@example.com'
        cls.second_inst.members = [cls.user.key, cls.other_user.key]
        cls.second_inst.followers = [cls.user.key, cls.other_user.key]
        cls.second_inst.posts = []
        cls.second_inst.admin = None
        cls.second_inst.put()


    def enqueue_task(self, handler_selector, params):
        """Method of mock enqueue tasks."""
        if handler_selector == 'add-admin-permissions' or handler_selector == 'remove-admin-permissions':
            self.testapp.post('/api/queue/' + handler_selector, params=params)

    @patch('utils.verify_token', return_value={'email': 'user@example.com'})
    def test_get(self, verify_token):
        """Test the get method."""
        # Call the get method
        all_institutions = self.testapp.get("/api/institutions").json

        self.assertEqual(len(all_institutions), 2,
                         "The length of all institutions list should be 2")

        self.assertEqual(all_institutions[0]['name'], self.first_inst.name,
                         "The name of institituion should be equal to the first_inst name")

        self.assertEqual(all_institutions[1]['name'], self.second_inst.name,
                         "The name of institution should be equal to the second_inst name")