# -*- coding: utf-8 -*-
"""Event model's test."""

from ..test_base import TestBase
from datetime import timedelta
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
        cls.user.state = 'active'
        cls.user.put()

        cls.another_user = mocks.create_user("another@gmail.com")
        cls.another_user.state = 'active'
        cls.another_user.put()
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
        todayDate = datetime.datetime.now()
        tomorrowDate = todayDate + timedelta(days=1)
        data = {'title': 'test event',
                'text': 'this event will be a test event',
                'photo_url': 'photo_url',
                'local': 'splab',
                'start_time': str(todayDate.strftime("%Y-%m-%dT%H:%M:%S")),
                'end_time': str(tomorrowDate.strftime("%Y-%m-%dT%H:%M:%S")),
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
    
    def test_add_follower(self):
        """Test regular add follower"""
        self.assertEqual(len(self.event.followers), 1)

        self.event.add_follower(self.another_user)

        self.assertEqual(len(self.event.followers), 2)
    
    def test_add_follower_with_an_inactive_user(self):
        """Test add an inactive user as a follower"""
        self.another_user.state = 'pending'
        self.another_user.put()

        self.assertEqual(len(self.event.followers), 1)

        with self.assertRaises(Exception) as ex:
            self.event.add_follower(self.another_user)

        self.assertEqual(str(ex.__dict__['exception']), "The user is not active")
        self.assertEqual(len(self.event.followers), 1)
    
    def test_add_an_user_who_is_a_follower_yet(self):
        """Test add a user who is a follower"""
        self.assertEqual(len(self.event.followers), 1)
        
        with self.assertRaises(Exception) as ex:
            self.event.add_follower(self.user)

        self.assertEqual(str(ex.__dict__['exception']), "The user is a follower yet")
        self.assertEqual(len(self.event.followers), 1)

    def test_remove_follower(self):
        """Test regular remove follower"""
        self.assertEqual(len(self.event.followers), 1)

        self.event.add_follower(self.another_user)

        self.assertEqual(len(self.event.followers), 2)

        self.event.remove_follower(self.another_user)

        self.assertEqual(len(self.event.followers), 1)
    
    def test_remove_a_user_who_is_not_a_follower(self):
        """Test remove a user who is not a follower"""
        self.assertEqual(len(self.event.followers), 1)

        with self.assertRaises(Exception) as ex:
            self.event.remove_follower(self.another_user)
        
        self.assertEqual(str(ex.__dict__['exception']), "The user is not a follower")
        self.assertEqual(len(self.event.followers), 1)
    
    def test_remove_a_user_who_is_the_author(self):
        """Test remove a user who is the author"""
        self.assertEqual(len(self.event.followers), 1)

        with self.assertRaises(Exception) as ex:
            self.event.remove_follower(self.user)
        
        self.assertEqual(str(ex.__dict__['exception']), "The user is the author")
        self.assertEqual(len(self.event.followers), 1)