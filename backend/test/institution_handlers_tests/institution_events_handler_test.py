# -*- coding: utf-8 -*-
"""Institution Events handler test."""

from test_base_handler import TestBaseHandler
from models import User
from models import Institution
from models import Event
from handlers.institution_events_handler import InstitutionEventsHandler
from google.appengine.ext import ndb
import json
import datetime
import mocks

from mock import patch


class InstitutionEventsHandlerTest(TestBaseHandler):
    """Institution Events handler test."""

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(InstitutionEventsHandlerTest, cls).setUp()
        app = cls.webapp2.WSGIApplication(
            [("/api/institutions/(.*)/events", InstitutionEventsHandler),
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)

    @patch('util.login_service.verify_token', return_value={'email': 'user@gmail.com'})
    def test_get_one_event(self, verify_token):
        """Test the institution_events_handler's get method."""

        institution = mocks.create_institution()
        user = mocks.create_user('user@gmail.com')
        event = mocks.create_event(user, institution)

        # Call the get method
        events = self.testapp.get("/api/institutions/%s/events?page=0&limit=1" % institution.key.urlsafe())

        # Retrieve the entity
        event_retrieved = (events.json['events'])[0]
        key_event = ndb.Key(urlsafe=event_retrieved['key'])
        event_obj = key_event.get()

        #Check the conditions
        self.assertEqual(event_obj.title, event.title,
                         "The titles must be equal")
        self.assertEqual(event_obj.start_time, event.start_time,
                         "The start_time must be equal")
        self.assertEqual(event_obj.end_time, event.end_time,
                         "The end_time must be equal")
        self.assertEqual(event_obj.author_key, user.key,
                         "The authors must be the same")
        self.assertEqual(event_obj.institution_key, institution.key,
                         "The institutions must be the same")

    @patch('util.login_service.verify_token', return_value={'email': 'user@gmail.com'})
    def test_get_events_from_a_passed_begin(self, verify_token):
        """Test the institution_events_handler's get method."""

        institution = mocks.create_institution()
        user = mocks.create_user('user@gmail.com')
        event = mocks.create_event(user, institution)
        second_event = mocks.create_event(user, institution)
        third_event = mocks.create_event(user, institution)

        # Call the get method
        events = self.testapp.get(
            "/api/institutions/%s/events?page=1&limit=2" % institution.key.urlsafe())

        # Retrieve the entity
        events_retrieved = (events.json['events'])
        keys = [obj['key'] for obj in events_retrieved]

        #Check the final conditions
        self.assertTrue(event.key.urlsafe() not in keys)
        self.assertTrue(second_event.key.urlsafe() not in keys)
        self.assertTrue(third_event.key.urlsafe() in keys)
        self.assertTrue(len(keys) == 1)

    @patch('util.login_service.verify_token', return_value={'email': 'user@gmail.com'})
    def test_get_many_events(self, verify_token):
        """Test the institution_events_handler's get method."""

        institution = mocks.create_institution()
        user = mocks.create_user('user@gmail.com')
        event = mocks.create_event(user, institution)
        second_event = mocks.create_event(user, institution)
        third_event = mocks.create_event(user, institution)

        # Call the get method
        events = self.testapp.get(
            "/api/institutions/%s/events?page=0&limit=3" % institution.key.urlsafe())
    
        # Retrieve the entity
        events_retrieved = (events.json['events'])
        keys = [obj['key'] for obj in events_retrieved]

        #Check the final conditions
        self.assertTrue(event.key.urlsafe() in keys)
        self.assertTrue(second_event.key.urlsafe() in keys)
        self.assertTrue(third_event.key.urlsafe() in keys)
        self.assertTrue(len(keys) == 3)
