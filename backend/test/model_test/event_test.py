# -*- coding: utf-8 -*-
"""Event model's test."""

from ..test_base import TestBase
from models import Institution
from models import User
from models import Event
from .. import mocks

from custom_exceptions import FieldException

import datetime
import json

class RequestUserTest(TestBase):
    """Class event tests."""

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        cls.test = cls.testbed.Testbed()
        cls.test.activate()
        cls.policy = cls.datastore.PseudoRandomHRConsistencyPolicy(
            probability=1)
        cls.test.init_datastore_v3_stub(consistency_policy=cls.policy)
        cls.test.init_memcache_stub()
        
        """Init the models."""
        # new User user
        cls.user = mocks.create_user("test@example.com")
        # new Institution
        cls.institution = mocks.create_institution()
        cls.institution.members = [cls.user.key]
        cls.institution.followers = [cls.user.key]
        cls.institution.admin = cls.user.key
        cls.institution.put()
        #Update User
        cls.user.add_institution(cls.institution.key)
        cls.user.follows = [cls.institution.key]
        cls.user.put()
        # Events
        cls.event = mocks.create_event(cls.user, cls.institution)

    def test_create(self):
        """Test create method."""
        data = {'title': 'test event',
                'text': 'this event will be a test event',
                'photo_url': 'photo_url',
                'local': 'splab',
                'start_time': str(datetime.datetime.now().strftime("%Y-%m-%dT%H:%M:%S")),
                'end_time': str(datetime.datetime(2018, 10, 20).strftime("%Y-%m-%dT%H:%M:%S")),
                'address': {}
                }
        new_event = Event.create(data, self.user, self.institution)

        self.assertEqual(new_event.title, data.get('title'))
        self.assertEqual(new_event.text, data.get('text'))
        self.assertEqual(new_event.photo_url, data.get('photo_url'))
        self.assertEqual(new_event.local, data.get('local'))
        self.assertEqual(new_event.author_key, self.user.key)
        self.assertEqual(new_event.institution_key, self.institution.key)
        self.assertEqual(new_event.author_name, self.user.name)
        self.assertEqual(new_event.institution_name, self.institution.name)

    def test_make(self):
        """Test make method."""
        event_json = Event.make(self.event)
        self.assertEqual(event_json.get('title'), self.event.title)
        self.assertEqual(event_json.get('text'), self.event.text)
        self.assertEqual(event_json.get('photo_url'), self.event.photo_url)
        self.assertEqual(event_json.get('local'), self.event.local)
        self.assertEqual(event_json.get('author_key'), self.user.key.urlsafe())
        self.assertEqual(event_json.get('institution_key'),
                         self.institution.key.urlsafe())
        self.assertEqual(event_json.get('author'), self.user.name)
        self.assertEqual(event_json.get('institution_name'), self.institution.name)

    def test_is_valid(self):
        """Test isValid method."""
        # Checking if the event is valid
        self.event.isValid()
        # Making the start_time be after the end_time
        self.event.start_time = datetime.datetime(3018, 10, 21)
        self.event.put()
        # Checking if the event is not valid
        with self.assertRaises(Exception) as raises_context:
            self.event.isValid()

        message_exception = str(raises_context.exception)

        self.assertEqual(
            message_exception,
            "The end time can not be before the start time",
            "Expected exception message must be equal to " +
            "The end time can not be before the start time")

        # making the event outdated
        self.event.start_time = datetime.datetime(1918, 10, 21)
        self.event.end_time = datetime.datetime(1918, 10, 22)
        self.event.put()
        
        try:
            is_patch = True
            self.event.isValid(is_patch)
        except FieldException as exc:
            msg = str(exc)
            self.fail("Should not raise the exception: " + msg)

    def test_verify_patch(self):
        """Test verify patch method."""
        self.event.start_time = '2000-07-14T12:30:15'
        self.event.end_time = '2000-07-15T12:30:15'
        self.event.put()

        forbidden_props = ["title", "official_site", "address", "local"]

        for prop in forbidden_props:
            patch = [{"op": "replace", "path": "/"+prop, "value": 'other_value'}]
            patch = json.dumps(patch)
            with self.assertRaises(FieldException) as raises_context:
                self.event.verify_patch(patch)

                exc_msg = str(raises_context.exception)
                self.assertEquals(
                    exc_msg,
                    "The event basic data can not be changed after it has ended",
                    "The exception message is not equal to the expected one"
                )
