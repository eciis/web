# -*- coding: utf-8 -*-
"""Search handler test."""

from test_base_handler import TestBaseHandler
from models.user import User
import search_module
from handlers.search_handler import SearchHandler


class SearchHandlerTest(TestBaseHandler):
    """Test the SearchHandler class."""

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(SearchHandlerTest, cls).setUp()
        app = cls.webapp2.WSGIApplication(
            [("/api/search/institution", SearchHandler),
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)
        initModels(cls)

    def test_get(self):
        """Test the search_handler's get method."""
        # Pretend an authentication
        self.os.environ['REMOTE_USER'] = 'mayzabeel@gmail.com'
        self.os.environ['USER_EMAIL'] = 'mayzabeel@gmail.com'
        # Call the createDocument method
        search_module.createDocument('123456', 'CERTBIO', 'active')
        # Call the get method
        institutions = self.testapp.get(
            "/api/search/institution?name=%s&state=%s" % ('CERTBIO', 'active'))
        self.assertTrue('CERTBIO' in institutions)
        # Make sure that there is no institution CERTBIO with pending state.
        institutions = self.testapp.get(
            "/api/search/institution?name=%s&state=%s" % ('CERTBIO', 'pending'))
        self.assertTrue('CERTBIO' not in institutions)
        # Create a document with a pending institution
        search_module.createDocument('123456', 'SPLAB', 'pending')
        # Make sure that there is no SPLAB with pending state.
        institutions = self.testapp.get(
            "/api/search/institution?name=%s&state=%s" % ('SPLAB', 'active'))
        self.assertTrue('SPLAB' not in institutions)
        # Assert that SPLAB has a pending state
        institutions = self.testapp.get(
            "/api/search/institution?name=%s&state=%s" % ('SPLAB', 'pending'))
        self.assertTrue('SPLAB' in institutions)

    def tearDown(cls):
        """Deactivate the test."""
        cls.test.deactivate()


def initModels(cls):
    """Init the models."""
    # new User Mayza
    cls.mayza = User()
    cls.mayza.name = 'Mayza Nunes'
    cls.mayza.cpf = '089.675.908-90'
    cls.mayza.email = 'mayzabeel@gmail.com'
    cls.mayza.institutions = []
    cls.mayza.follows = []
    cls.mayza.institutions_admin = []
    cls.mayza.notifications = []
    cls.mayza.posts = []
    cls.mayza.put()
