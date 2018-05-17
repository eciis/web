# -*- coding: utf-8 -*-
"""Event handler test."""

from test_base_handler import TestBaseHandler
from models import User
from models import Institution
from models import Event
from handlers.event_handler import EventHandler
from mock import patch

import datetime
import json
import mocks


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
        
        """Init the models."""
        # new User
        cls.user = mocks.create_user('user@gmail.com')
        # new User
        cls.second_user = mocks.create_user('usersd@gmail.com')
        # new Institution
        cls.institution = mocks.create_institution()
        cls.institution.members = [cls.user.key]
        cls.institution.followers = [cls.user.key]
        cls.institution.admin = cls.user.key
        cls.institution.put()

        """ Update User."""
        cls.user.add_institution(cls.institution.key)
        cls.user.follows = [cls.institution.key]
        cls.user.put()

        # Events
        cls.event = mocks.create_event(cls.user, cls.institution)

    @patch('util.login_service.verify_token', return_value={'email': 'user@gmail.com'})
    def test_delete_by_author(self, verify_token):
        """Test the event_handler's delete method when user is author."""
        self.user.add_permissions(
            ['edit_post', 'remove_post'], self.event.key.urlsafe())
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

    @patch('util.login_service.verify_token', return_value={'email': 'usersd@gmail.com'})
    def test_delete_by_admin(self, verify_token):
        """Test the event_handler's delete method when user is admin."""
        # Call the delete method and assert that it raises an exception,
        # because the user doesn't have the permission yet.
        with self.assertRaises(Exception) as raises_context:
            self.testapp.delete("/api/events/%s" %
                                self.event.key.urlsafe())
        message = self.get_message_exception(str(raises_context.exception))
        self.assertEquals(message, "Error! The user can not remove this event")
        
        #Add permission of admin
        self.second_user.add_permissions(["remove_posts"], self.event.institution_key.urlsafe())

        # Call the delete method
        self.testapp.delete("/api/events/%s" %
                            self.event.key.urlsafe())
        # Refresh event
        self.event = self.event.key.get()
        # Verify if after delete the state of event is deleted
        self.assertEqual(self.event.state, "deleted",
                         "The state expected was deleted.")
        # Verify if after delete the last_modified
        self.assertEqual(self.event.last_modified_by, self.second_user.key,
                         "The last_modified_by expected was user.")

    @patch('util.login_service.verify_token', return_value={'email': 'user@gmail.com'})
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
        self.user.add_permission('edit_post', self.event.key.urlsafe())
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

        # Call the patch method and assert that it raises an exception
        with self.assertRaises(Exception):
            self.testapp.patch_json("/api/events/%s"
                                    % self.event.key.urlsafe(),
                                    [{"op": "replace", "path": "/local",
                                      "value": "New Local"}]
                                    )

    @patch('util.login_service.verify_token', return_value={'email': 'user@gmail.com'})
    def test_pacth_datetime(self, verify_token):
        """Test pacth datetimes in event handler."""
        json_edit = json.dumps([
            {"op": "replace", "path": "/start_time",
                "value": '2018-07-14T12:30:15'},
            {"op": "replace", "path": "/end_time",
                "value": '2018-07-25T12:30:15'}
        ])
        self.user.add_permission('edit_post', self.event.key.urlsafe())

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

    @patch('util.login_service.verify_token', return_value={'email': 'user@gmail.com'})
    def test_patch_on_event_outdated(self, verify_token):
        """Test change the event basic data when it is outdated."""
        self.event.start_time = '2000-07-14T12:30:15'
        self.event.end_time = '2000-07-15T12:30:15'
        self.event.put()
        self.user.add_permission('edit_post', self.event.key.urlsafe())

        forbidden_props = ["title", "official_site", "address", "local"]

        for prop in forbidden_props:
            patch = [{"op": "replace", "path": "/"+prop, "value": 'other_value'}]
            with self.assertRaises(Exception):
                self.testapp.patch("/api/events/" +
                                self.event.key.urlsafe(),
                                json.dumps(patch))
        
        allowed_props = ['photo_url', 'video_url', 'useful_links', 
                        'programation', 'text']
        
        for prop in allowed_props:
            value = "other_value"
            if prop == 'video_url' or prop == 'useful_links': 
                value =["link"]
                
            patch = [{"op": "replace", "path": "/"+prop, "value": value}]
            self.testapp.patch("/api/events/" +
                            self.event.key.urlsafe(),
                            json.dumps(patch))

            self.event = self.event.key.get()
            self.assertEquals(
                getattr(self.event, prop), value,
                "The event "+ prop + " should be 'other_value'")
    
    @patch('util.login_service.verify_token', return_value={'email': 'user@gmail.com'})
    def test_get_a_deleted_event(self, verify_token):
        self.event.state = 'deleted'
        self.event.put()

        with self.assertRaises(Exception) as ex:
            self.testapp.get('/api/events/%s' %self.event.key.urlsafe())

        exception_message = self.get_message_exception(ex.exception.message)
        self.assertTrue(exception_message == 'Error! The event has been deleted.')
    
    @patch('util.login_service.verify_token', return_value={'email': 'user@gmail.com'})
    def test_patch_a_deleted_event(self, verify_token):
        self.event.state = 'deleted'
        self.event.put()
        self.user.add_permission('edit_post', self.event.key.urlsafe())

        with self.assertRaises(Exception) as ex:
            patch = [{"op": "replace", "path": "/title", "value": 'other_value'}]
            self.testapp.patch('/api/events/%s' % self.event.key.urlsafe(), json.dumps(patch))

        exception_message = self.get_message_exception(ex.exception.message)
        self.assertTrue(exception_message ==
                        'Error! The event has been deleted.')
    
    @patch('util.login_service.verify_token', return_value={'email': 'user@gmail.com'})
    def test_permissions_in_delete(self, verify_token):
        """Test the permissions in delete."""
        with self.assertRaises(Exception) as ex:
            self.testapp.delete("/api/events/%s" %
                                self.event.key.urlsafe())
        exception_message = self.get_message_exception(ex.exception.message)

        self.assertTrue(exception_message ==
                        "Error! The user can not remove this event")

        self.event = self.event.key.get()
        self.assertTrue(self.event.state != 'deleted')

        self.user.add_permissions(['edit_post', 'remove_post'], self.event.key.urlsafe())
        self.testapp.delete("/api/events/%s" %self.event.key.urlsafe())
        
        self.event = self.event.key.get()
        self.assertTrue(self.event.state == 'deleted')

    @patch('util.login_service.verify_token', return_value={'email': 'user@gmail.com'})
    def test_patch_without_permission(self, verify_token):
        with self.assertRaises(Exception) as ex:
            patch = [{"op": "replace", "path": "/title", "value": 'other_value'}]
            self.testapp.patch('/api/events/%s' %
                               self.event.key.urlsafe(), json.dumps(patch))

        exception_message = self.get_message_exception(ex.exception.message)
        self.assertTrue(exception_message ==
                        'Error! The user can not edit this event')
        

    def tearDown(cls):
        """Deactivate the test."""
        cls.test.deactivate()
