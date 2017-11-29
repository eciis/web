# -*- coding: utf-8 -*-
"""Remove Institution Handler test."""

from test_base_handler import TestBaseHandler
from worker import RemoveInstitutionHandler
from models.user import User
from models.institution import Institution


class RemoveInstitutionHandlerTest(TestBaseHandler):
    """Test Remove Institution Handler."""

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(RemoveInstitutionHandlerTest, cls).setUp()
        methods = set(cls.webapp2.WSGIApplication.allowed_methods)
        methods.add('PATCH')
        cls.webapp2.WSGIApplication.allowed_methods = frozenset(methods)
        app = cls.webapp2.WSGIApplication(
            [
                ('/api/queue/remove-inst', RemoveInstitutionHandler)
            ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)
        initModels(cls)

    def test_post(self):
        """Test the post method."""
        # Verify the members
        self.assertTrue(self.inst1.key in self.user1.institutions)
        self.assertTrue(self.inst1.key in self.user2.institutions)
        # Call the post method
        self.testapp.post('/api/queue/remove-inst?institution_key=%s&remove_hierarchy=true'
                          % (self.inst1.key.urlsafe()))
        # Retrieving the entities
        self.user1 = self.user1.key.get()
        self.user2 = self.user2.key.get()
        # Check if the method worked as expected
        self.assertTrue(self.inst1.key not in self.user1.institutions)
        self.assertTrue(self.inst1.key not in self.user2.institutions)
        self.assertTrue(self.inst1.key not in self.user1.institutions_admin)


def initModels(cls):
    """Init the models."""
    # new User1
    cls.user1 = User()
    cls.user1.name = 'User 1'
    cls.user1.cpf = '089.675.908-90'
    cls.user1.email = ['user1@email.com']
    cls.user1.institutions = []
    cls.user1.follows = []
    cls.user1.institutions_admin = []
    cls.user1.notifications = []
    cls.user1.posts = []
    cls.user1.put()
    # new User2
    cls.user2 = User()
    cls.user2.name = 'User 2'
    cls.user2.cpf = '089.675.908-65'
    cls.user2.email = ['user2@email.com']
    cls.user2.state = "pending"
    cls.user2.institutions = []
    cls.user2.follows = []
    cls.user2.institutions_admin = []
    cls.user2.notifications = []
    cls.user2.posts = []
    cls.user2.put()
    # new Inst1
    cls.inst1 = Institution()
    cls.inst1.name = 'Inst 1'
    cls.inst1.acronym = 'Inst 1'
    cls.inst1.cnpj = '18.104.068/0001-86'
    cls.inst1.legal_nature = 'public'
    cls.inst1.actuation_area = ''
    cls.inst1.description = 'Ensaio Químico'
    cls.inst1.email = 'inst1@email.com'
    cls.inst1.phone_number = '(83) 3322 4455'
    cls.inst1.members = [cls.user1.key, cls.user2.key]
    cls.inst1.followers = [cls.user1.key, cls.user2.key]
    cls.inst1.posts = []
    cls.inst1.admin = cls.user1.key
    cls.inst1.put()
    cls.user1.institutions_admin = [cls.inst1.key]
    cls.user1.institutions.append(cls.inst1.key)
    cls.user2.institutions.append(cls.inst1.key)
    cls.user1.follows.append(cls.inst1.key)
    cls.user2.follows.append(cls.inst1.key)
    cls.user1.add_permission("publish_post", cls.inst1.key.urlsafe())
    cls.user2.add_permission("publish_post", cls.inst1.key.urlsafe())
    cls.user2.put()
    cls.user1.put()
