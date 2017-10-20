# -*- coding: utf-8 -*-
"""Event model's test."""

from ..test_base import TestBase
from models.institution import Institution
from models.user import User
from models.event import Event
import datetime


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
        initModels(cls)

    def test_create(self):
        """Test create method."""
        data = {'title': 'test event',
                'text': 'this event will be a test event',
                'photo_url': 'photo_url',
                'local': 'splab',
                'start_time': str(datetime.datetime.now().strftime("%Y-%m-%dT%H:%M:%S")),
                'end_time': str(datetime.datetime.now().strftime("%Y-%m-%dT%H:%M:%S"))}
        new_event = Event.create(data, self.user.key, self.user.name, self.user.photo_url,
                                 self.certbio.key, self.certbio.name, self.certbio.photo_url)
        self.assertEqual(new_event.title, data.get('title'))
        self.assertEqual(new_event.text, data.get('text'))
        self.assertEqual(new_event.photo_url, data.get('photo_url'))
        self.assertEqual(new_event.local, data.get('local'))
        self.assertEqual(new_event.author_key, self.user.key)
        self.assertEqual(new_event.institution_key, self.certbio.key)
        self.assertEqual(new_event.author_name, self.user.name)
        self.assertEqual(new_event.institution_name, self.certbio.name)

    def test_make(self):
        """Test make method."""
        event_json = Event.make(self.event)
        self.assertEqual(event_json.get('title'), self.event.title)
        self.assertEqual(event_json.get('text'), self.event.text)
        self.assertEqual(event_json.get('photo_url'), self.event.photo_url)
        self.assertEqual(event_json.get('local'), self.event.local)
        self.assertEqual(event_json.get('author_key'), self.user.key.urlsafe())
        self.assertEqual(event_json.get('institution_key'),
                         self.certbio.key.urlsafe())
        self.assertEqual(event_json.get('author'), self.user.name)
        self.assertEqual(event_json.get('institution_name'), self.certbio.name)


def initModels(cls):
    """Init the models."""
    # new User user
    cls.user = User()
    cls.user.name = 'user name'
    cls.user.photo_url = 'urlphoto'
    cls.user.put()
    # new Institution CERTBIO
    cls.certbio = Institution()
    cls.certbio.name = 'CERTBIO'
    cls.certbio.photo_url = 'urlphoto'
    cls.certbio.members = [cls.user.key]
    cls.certbio.followers = [cls.user.key]
    cls.certbio.admin = cls.user.key
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
