# -*- coding: utf-8 -*-
"""Like Post handler test."""

from test_base_handler import TestBaseHandler
from models.user import User
from models.institution import Institution
from models.event import Event
from handlers.event_handler import EventHandler

from mock import patch
import datetime


class EventHandlerTest(TestBaseHandler):
    """Test the handler event_handler."""

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(EventHandlerTest, cls).setUp()
        app = cls.webapp2.WSGIApplication(
            [("/api/calendar/event/(.*)", EventHandler),
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)
        initModels(cls)

    @patch('utils.verify_token', return_value={'email': 'user@gmail.com'})
    def test_delete(self, verify_token):
        """Test the event_handler's delete method."""

        # Call the delete method
        self.testapp.delete("/api/calendar/event/%s" %
                            self.event.key.urlsafe())
        # Refresh mayza_post
        self.event = self.event.key.get()
        # Verify if after delete the state of event is deleted
        self.assertEqual(self.event.state, "deleted",
                         "The state expected was deleted.")

    @patch('utils.verify_token', return_value={'email': 'user@gmail.com'})
    def test_patch(self, verify_token):
        """Test the post_handler's patch method."""
        # Call the patch method and assert that it works
        self.testapp.patch_json("/api/events/%s"
                                % self.event.key.urlsafe(),
                                [{"op": "replace", "path": "/title",
                                    "value": "Edit Event"},
                                 {"op": "replace", "path": "/text",
                                    "value": "Edit Text Event"},
                                 {"op": "replace", "path": "/local",
                                     "value": "New Local"}
                                 ])
    #     self.event = self.event.key.get()
    #     self.assertEqual(self.event.title, "Edit Event")
    #     self.assertEqual(self.event.text, "Edit Text Event")
    #     self.assertEqual(self.event.local, "New Local")
        # # Pretend a new authentication
        # verify_token.return_value = {'email': 'usersd@ccc.ufcg.edu.br'}

        # # Call the patch method and assert that it works
        # self.testapp.patch_json("/api/events/%s"
        #                         % self.event.key.urlsafe(),
        #                         [{"op": "replace", "path": "/local",
        #                             "value": "New Local"}]
        #                         )
        # self.second_user_post = self.second_user_post.key.get()
        # self.assertEqual(self.second_user_post.text, "testando")
        # # Call the patch method and assert that  it raises an exception
        # with self.assertRaises(Exception):
        #     self.testapp.patch_json("/api/posts/%s"
        #                             % self.first_user_post.key.urlsafe(),
        #                             [{"op": "replace", "path": "/text",
        #                               "value": "testando"}]
        #                             )
        # # test the case when the post has a like, so it can not be updated
        # self.first_user_post.like(self.second_user.key)
        # self.first_user_post = self.first_user_post.key.get()
        # with self.assertRaises(Exception):
        #     self.testapp.patch_json("/api/posts/%s"
        #                             % self.first_user_post.key.urlsafe(),
        #                             [{"op": "replace", "path": "/text",
        #                                 "value": "testando"}]
        #                             )

        # # test the case when the post has a comment, so it can not be updated
        # self.first_user_post.add_comment(self.second_user_comment)
        # self.first_user_post = self.first_user_post.key.get()
        # with self.assertRaises(Exception):
        #     self.testapp.patch_json("/api/posts/%s"
        #                             % self.first_user_post.key.urlsafe(),
        #                             [{"op": "replace", "path": "/text",
        #                                 "value": "testando"}]
        #                             )

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
    cls.user.email = 'user@gmail.com'
    cls.user.put()
    # new User user
    cls.second_user = User()
    cls.second_user.name = 'second'
    cls.second_user.photo_url = 'urlphoto'
    cls.second_user.cpf = '089.675.908-09'
    cls.second_user.email = 'usersd@gmail.com'
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
