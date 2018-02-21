# -*- coding: utf-8 -*-
"""Institution collection handler test."""
from test_base_handler import TestBaseHandler
from handlers.institution_collection_handler import InstitutionCollectionHandler

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
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)


    @patch('utils.verify_token', return_value={'email': 'user@example.com'})
    def test_get(self, verify_token):
        """Test the get method."""
        # create models
        # new User
        user = mocks.create_user('user@example.com')
        user.name = "User"
        # new User Other
        other_user = mocks.create_user('other_user@example.com')
        other_user.state = "pending"
        other_user.put()
        # new Institution FIRST INST
        first_inst = mocks.create_institution()
        first_inst.name = 'FIRST INST'
        first_inst.put()
        # new Institution SECOND INST
        second_inst = mocks.create_institution()
        second_inst.name = 'SECOND INST'
        second_inst.put()

        # Call the get method
        all_institutions = self.testapp.get("/api/institutions").json

        self.assertEqual(len(all_institutions), 2,
                         "The length of all institutions list should be 2")

        self.assertEqual(all_institutions[0]['name'], first_inst.name,
                         "The name of institituion should be equal to the first_inst name")

        self.assertEqual(all_institutions[1]['name'], second_inst.name,
                         "The name of institution should be equal to the second_inst name")