# -*- coding: utf-8 -*-
"""Calendar handler test."""

from .. import mocks
from ..test_base_handler import TestBaseHandler
from models import User
from models import Institution
from models import Event
from handlers.event_collection_handler import EventCollectionHandler, get_filtered_events
from google.appengine.ext import ndb
import json
import datetime

from mock import patch


class EventCollectionHandlerTest(TestBaseHandler):
    """Calendar handler test."""

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(EventCollectionHandlerTest, cls).setUp()
        app = cls.webapp2.WSGIApplication(
            [("/api/events.*", EventCollectionHandler),
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)
        initModels(cls)

    @patch('util.login_service.verify_token', return_value={'email': 'user@gmail.com'})
    def test_post(self, verify_token):
        """Test the calendar_handler's post event method."""

        # Make the request and assign the answer to post
        event = self.testapp.post_json("/api/events", {
            'title': 'new event',
            'institution_key': self.certbio.key.urlsafe(),
            'text': 'testing new event',
            'start_time': '2027-12-24T10:25:48',
            'end_time': '2027-12-25T10:25:48',
            'local': 'local do evento',
            'address': {}
            })
        # Retrieve the entities
        event = json.loads(event._app_iter[0])
        key_event = ndb.Key(urlsafe=event['key'])
        event_obj = key_event.get()
        self.certbio = self.certbio.key.get()
        self.user = self.user.key.get()

        # Check if the event's attributes are the expected
        self.assertEqual(event_obj.title, 'new event',
                         "The title expected was new event")
        self.assertEqual(event_obj.institution_key, self.certbio.key,
                         "The post's institution is not the expected one")
        self.assertEqual(event_obj.text,
                         'testing new event',
                         "The post's text is not the expected one")
        self.assertTrue(self.user.has_permission('remove_post', event_obj.key.urlsafe()))
        self.assertTrue(self.user.has_permission(
            'edit_post', event_obj.key.urlsafe()))

        # Check if raise exception when the end time of event is before the start time
        with self.assertRaises(Exception) as raises_context:
            self.testapp.post_json("/api/events", {
                'title': 'new event',
                'institution_key': self.certbio.key.urlsafe(),
                'text': 'testing new event',
                'start_time': '2027-12-24T10:25:48',
                'end_time': '2027-12-20T10:25:48',
                'local': 'local do evento',
                'address': {}
                })

        message_exception = self.get_message_exception(str(raises_context.exception))

        self.assertEqual(
            message_exception,
            "Error! The end time can not be before the start time",
            "Expected exception message must be equal to " +
            "Error! The end time can not be before the start time")

        # Check if raise exception when the end time of event is before today
        with self.assertRaises(Exception) as raises_context:
            self.testapp.post_json("/api/events", {
                'title': 'new event',
                'institution_key': self.certbio.key.urlsafe(),
                'text': 'testing new event',
                'start_time': '2010-12-24T10:25:48',
                'end_time': '2010-12-25T10:25:48',
                'local': 'local do evento',
                'address': {}
                })

        message_exception = self.get_message_exception(str(raises_context.exception))

        self.assertEqual(
            message_exception,
            "Error! The end time must be after the current time",
            "Excpected exception message must be equal to " +
            "Error! The end time must be after the current time")

    @patch('util.login_service.verify_token', return_value={'email': 'user@gmail.com'})
    def test_get(self, verify_token):
        """Test the calendar_handler's post event method."""

        # Call the get method
        events = self.testapp.get("/api/events?page=0&limit=1")

        # Retrieve the entities
        event = (events.json['events'])[0]
        key_event = ndb.Key(urlsafe=event['key'])
        event_obj = key_event.get()
        self.certbio = self.certbio.key.get()
        self.user = self.user.key.get()

        # Check if the event's attributes are the expected
        self.assertEqual(event_obj.title, 'New Event',
                         "The title expected was new event")
        self.assertEqual(event_obj.institution_key, self.certbio.key,
                         "The post's institution is not the expected one")
        self.assertEqual(event_obj.local,
                         'Event location',
                         "The event's local is not the expected one")

    def test_get_filtered_events_with_date_filters(self):
        """Test the get query of events filtered by date"""

        filters = [('page', '0'), ('limit', '1'), ('month', str(self.date.month)), ('year', str(self.date.year))]
        query_events = get_filtered_events(filters, self.user).fetch()

        self.assertEqual(len(query_events), 2,
                    "Should return only the events that happens the current month")

    def test_get_filtered_events_without_date_filters(self):
        """Test the get query events not filtered"""

        filters = [('page', '0'), ('limit', '1')]
        query_events = get_filtered_events(filters, self.user).fetch()

        self.assertEqual(len(query_events), 4,
                    "Should return all created events in the initModels")

def setup_title_and_local(event):
    event.title = "New Event"
    event.local = "Event location"
    event.put()

def setup_photo_url(entity):
    entity.photo_url = 'urlphoto'
    entity.put()

def setup_date(event, date):
    two_months_later = datetime.datetime(date.year if date.month < 11 else date.year+1, date.month+2 if date.month < 11 else 2, 15)
    event.start_time = two_months_later
    event.end_time = two_months_later
    event.put()

def initModels(cls):
    """Init the models."""
    # new User user
    cls.user = mocks.create_user("user@gmail.com")
    setup_photo_url(cls.user)

    # new Institution CERTBIO
    cls.certbio = mocks.create_institution("CERTBIO")
    setup_photo_url(cls.certbio)

    """ Update User."""
    cls.user.add_institution(cls.certbio.key)
    cls.user.follows = [cls.certbio.key]
    cls.user.put()

    # Util date
    cls.date = datetime.datetime.now()

    # Events
    cls.event = mocks.create_event(cls.user, cls.certbio)
    setup_title_and_local(cls.event)

    cls.other_event = mocks.create_event(cls.user, cls.certbio)
    setup_title_and_local(cls.other_event)

    cls.distant_event = mocks.create_event(cls.user, cls.certbio)
    setup_title_and_local(cls.distant_event)
    setup_date(cls.distant_event, cls.date)

    cls.other_distant_event = mocks.create_event(cls.user, cls.certbio)
    setup_title_and_local(cls.other_distant_event)
    setup_date(cls.other_distant_event, cls.date)