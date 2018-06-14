# -*- coding: utf-8 -*-
"""Calendar handler test."""

from ..test_base_handler import TestBaseHandler
from models import User
from models import Institution
from models import Event
from handlers.event_collection_handler import EventCollectionHandler
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


def initModels(cls):
    """Init the models."""
    # new User user
    cls.user = User()
    cls.user.name = 'user name'
    cls.user.photo_url = 'urlphoto'
    cls.user.cpf = '089.675.908-90'
    cls.user.email = ['user@gmail.com']
    cls.user.put()
    # new Institution CERTBIO
    cls.certbio = Institution()
    cls.certbio.name = 'CERTBIO'
    cls.certbio.photo_url = 'urlphoto'
    cls.certbio.members = [cls.user.key]
    cls.certbio.followers = [cls.user.key]
    cls.certbio.admin = cls.user.key
    cls.certbio.state = "active"
    cls.certbio.put()

    """ Update User."""
    cls.user.add_institution(cls.certbio.key)
    cls.user.follows = [cls.certbio.key]
    cls.user.put()

    # Events
    cls.event = Event()
    cls.event.title = "New Event"
    cls.event.author_key = cls.user.key
    cls.event.author_name = cls.user.name
    cls.event.author_photo = cls.user.photo_url
    cls.event.institution_key = cls.certbio.key
    cls.event.institution_name = cls.certbio.name
    cls.event.institution_image = cls.certbio.photo_url
    cls.event.start_time = datetime.datetime.now()
    cls.event.end_time = datetime.datetime.now()
    cls.event.local = "Event location"
    cls.event.put()
