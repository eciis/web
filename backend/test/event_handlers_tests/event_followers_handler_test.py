# -*- coding: utf-8 -*-
"""Event Followers handler test."""

from ..test_base_handler import TestBaseHandler
from models import User
from models import Institution
from models import Event
from handlers import EventFollowersHandler
from mock import patch

import json
from .. import mocks


class EventFollowersHandlerTest(TestBaseHandler):
    """Test Event Followers Handler."""

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(EventFollowersHandlerTest, cls).setUp()
        methods = set(cls.webapp2.WSGIApplication.allowed_methods)
        methods.add('PATCH')
        cls.webapp2.WSGIApplication.allowed_methods = frozenset(methods)
        app = cls.webapp2.WSGIApplication(
            [("/api/events/(.*)/followers", EventFollowersHandler)
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)
        
        """Init the models."""
        cls.user = mocks.create_user('user@gmail.com')
        cls.another_user = mocks.create_user('another@gmail.com')
        cls.another_user.state = 'active'
        cls.another_user.put()

        cls.institution = mocks.create_institution()
        cls.institution.members = [cls.user.key]
        cls.institution.followers = [cls.user.key]
        cls.institution.admin = cls.user.key
        cls.institution.put()

        cls.user.add_institution(cls.institution.key)
        cls.user.follows = [cls.institution.key]
        cls.user.put()

        cls.event = mocks.create_event(cls.user, cls.institution)

    @patch('util.login_service.verify_token', return_value={'email': 'another@gmail.com'})
    def test_post(self, verify_token):
        """."""
        self.assertEqual(len(self.event.followers), 1)

        self.testapp.post("/api/events/%s/followers" %self.event.key.urlsafe())

        self.event = self.event.key.get()

        self.assertEqual(len(self.event.followers), 2)
    
    @patch('util.login_service.verify_token', return_value={'email': 'another@gmail.com'})
    def test_post_with_unpublished_event(self, verify_token):
        """."""
        self.assertEqual(len(self.event.followers), 1)
        self.event.state = 'draft'
        self.event.put()

        with self.assertRaises(Exception) as ex:
            self.testapp.post("/api/events/%s/followers" %self.event.key.urlsafe())

        exception_message = self.get_message_exception(ex.exception.message)
        self.assertEqual(exception_message, "Error! The event is not published")
    
    @patch('util.login_service.verify_token', return_value={'email': 'another@gmail.com'})
    def test_delete_a_not_follower(self, verify_token):
        """."""
        self.assertEqual(len(self.event.followers), 1)

        with self.assertRaises(Exception) as ex:
            self.testapp.delete("/api/events/%s/followers" %self.event.key.urlsafe())

        exception_message = self.get_message_exception(ex.exception.message)
        self.assertEqual(exception_message, "Error! The user is not a follower")
    
    @patch('util.login_service.verify_token', return_value={'email': 'another@gmail.com'})
    def test_delete_with_a_deleted_event(self, verify_token):
        """."""
        self.assertEqual(len(self.event.followers), 1)
        self.event.state = 'deleted'
        self.event.put()

        with self.assertRaises(Exception) as ex:
            self.testapp.delete("/api/events/%s/followers" %self.event.key.urlsafe())

        exception_message = self.get_message_exception(ex.exception.message)
        self.assertEqual(exception_message, "Error! The event is not published")
    
    @patch('util.login_service.verify_token', return_value={'email': 'another@gmail.com'})
    def test_delete(self, verify_token):
        """."""
        self.assertEqual(len(self.event.followers), 1)

        self.testapp.post("/api/events/%s/followers" %self.event.key.urlsafe())

        self.event = self.event.key.get()
        self.assertEqual(len(self.event.followers), 2)

        self.testapp.delete("/api/events/%s/followers" %self.event.key.urlsafe())

        self.event = self.event.key.get()
        self.assertEqual(len(self.event.followers), 1)
        
        

    def tearDown(cls):
        """Deactivate the test."""
        cls.test.deactivate()
