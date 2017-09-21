# -*- coding: utf-8 -*-
"""Like Post handler test."""

from test_base_handler import TestBaseHandler
from models.user import User
from models.institution import Institution
from models.event import Event
from handlers.event_handler import EventHandler

from mock import patch
import datetime
import json


class EventHandlerTest(TestBaseHandler):
    """Test the handler event_handler."""

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(EventHandlerTest, cls).setUp()
        methods = set(cls.webapp2.WSGIApplication.allowed_methods)
        methods.add('PATCH')
        cls.webapp2.WSGIApplication.allowed_methods = frozenset(methods)
        app = cls.webapp2.WSGIApplication(
            [("/api/events/(.*)", EventHandler)
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)
        initModels(cls)

    @patch('utils.verify_token', return_value={'email': 'user@gmail.com'})
    def test_delete(self, verify_token):
        """Test the event_handler's delete method."""
        # Call the delete method
        self.testapp.delete("/api/events/%s" %
                            self.event.key.urlsafe())
        # Refresh event
        self.event = self.event.key.get()
        # Verify if after delete the state of event is deleted
        self.assertEqual(self.event.state, "deleted",
                         "The state expected was deleted.")
        # Verify if after delete the last_modified
        self.assertEqual(self.event.last_modified_by, self.user.key,
                         "The last_modified_by expected was user.")

        # Pretend a new authentication
        verify_token.return_value = {'email': 'usersd@gmail.com'}

        # Call the patch method and assert that  it raises an exception
        with self.assertRaises(Exception):
            self.testapp.delete("/api/events/%s" %
                                self.event.key.urlsafe())

    @patch('utils.verify_token', return_value={'email': 'user@gmail.com'})
    def test_patch(self, verify_token):
        """Test the post_handler's patch method."""
        # Call the patch method and assert that it works
        json_edit = json.dumps([{"op": "replace", "path": "/title",
                                 "value": "Edit Event"},
                                {"op": "replace", "path": "/text",
                                 "value": "Edit Text Event"},
                                {"op": "replace", "path": "/local",
                                 "value": "New Local"},
                                {"op": "replace", "path": "/start_time",
                                 "value": '2018-07-14T12:30:15'},
                                {"op": "replace", "path": "/end_time",
                                 "value": '2018-07-25T12:30:15'}
                                ])

        self.testapp.patch("/api/events/" +
                           self.event.key.urlsafe(),
                           json_edit)

        self.event = self.event.key.get()
        self.assertEqual(self.event.title, "Edit Event")
        self.assertEqual(self.event.text, "Edit Text Event")
        self.assertEqual(self.event.local, "New Local")
        self.assertEqual(self.event.start_time.isoformat(),
                         '2018-07-14T12:30:15')
        self.assertEqual(self.event.end_time.isoformat(),
                         '2018-07-25T12:30:15')

        # test the case when the start_time is after end_time
        with self.assertRaises(Exception):
            self.testapp.patch_json("/api/events/" +
                                    self.event.key.urlsafe(),
                                    [{"op": "replace", "path": "/start_time",
                                      "value": '2018-07-27T12:30:15'}
                                     ]
                                    )

        # test the case when the end_time is before start_time
        with self.assertRaises(Exception):
            self.testapp.patch_json("/api/events/" +
                                    self.event.key.urlsafe(),
                                    [{"op": "replace", "path": "/end_time",
                                      "value": '2018-07-07T12:30:15'}
                                     ]
                                    )

        # Pretend a new authentication
        verify_token.return_value = {'email': 'usersd@gmail.com'}

        # Call the patch method and assert that  it raises an exception
        with self.assertRaises(Exception):
            self.testapp.patch_json("/api/events/%s"
                                    % self.event.key.urlsafe(),
                                    [{"op": "replace", "path": "/local",
                                      "value": "New Local"}]
                                    )

    @patch('utils.verify_token', return_value={'email': 'user@gmail.com'})
    def test_pacth_datetime(self, verify_token):
        """Test pacth datetimes in event handler."""
        json_edit = json.dumps([
            {"op": "replace", "path": "/start_time",
                "value": '2018-07-14T12:30:15'},
            {"op": "replace", "path": "/end_time",
                "value": '2018-07-25T12:30:15'}
        ])

        self.testapp.patch("/api/events/" +
                           self.event.key.urlsafe(),
                           json_edit)

        self.event = self.event.key.get()

        self.assertTrue(isinstance(self.event.start_time, datetime.datetime))
        self.assertTrue(isinstance(self.event.end_time, datetime.datetime))
        self.assertEqual(self.event.start_time.isoformat(),
                         '2018-07-14T12:30:15')
        self.assertEqual(self.event.end_time.isoformat(),
                         '2018-07-25T12:30:15')

    def tearDown(cls):
        """Deactivate the test."""
        cls.test.deactivate()


def initModels(cls):
    """Init the models."""
    # new User user
    cls.user = User()
    cls.user.name = 'user name'
    cls.user.photo_url = 'urlphoto'
    cls.user.cpf = '089.675.908-90'
    cls.user.email = ['user@gmail.com']
    cls.user.put()
    # new User user
    cls.second_user = User()
    cls.second_user.name = 'second'
    cls.second_user.photo_url = 'urlphoto'
    cls.second_user.cpf = '089.675.908-09'
    cls.second_user.email = ['usersd@gmail.com']
    cls.second_user.put()
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
    cls.event.institution_photo = cls.certbio.photo_url
    cls.event.start_time = datetime.datetime.now()
    cls.event.end_time = datetime.datetime.now()
    cls.event.local = "Event location"
    cls.event.put()
