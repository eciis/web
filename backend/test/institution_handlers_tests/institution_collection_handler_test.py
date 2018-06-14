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


    @patch('util.login_service.verify_token', return_value={'email': 'user@example.com'})
    def test_get(self, verify_token):
        """Test the get method."""
        # create models
        # new User
        user = mocks.create_user('user@example.com')
        # new Institution FIRST INST
        first_inst = mocks.create_institution('FIRST INST')
        first_inst.state = "active"
        first_inst.put()
        # new Institution SECOND INST with pending state default 
        second_inst = mocks.create_institution('SECOND INST')
        # new Institution THIRD INST
        third_inst = mocks.create_institution('THIRD INST')
        third_inst.state = "active"
        third_inst.put()

        # Call the get method
        all_institutions = self.testapp.get("/api/institutions?page=0&&limit=2").json
        
        self.assertEqual(len(all_institutions), 2,
                         "The length of all institutions list should be 2")

        self.assertEqual(all_institutions['institutions'][0]['name'], first_inst.name,
                         "The name of institituion should be equal to the first_inst name")

        self.assertEqual(all_institutions['institutions'][1]['name'], third_inst.name,
                         "The name of institution should be equal to the third_inst name")