# -*- coding: utf-8 -*-
"""Like Post handler test."""

from test_base_handler import TestBaseHandler
from models.user import User
from models.institution import Institution
from models.event import Event
from handlers.event_handler import EventHandler

from mock import patch
import datetime


class LikePostHandlerTest(TestBaseHandler):
    """Test the handler event_handler."""

    LIKE_URI = "/api/posts/%s/likes"

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(LikePostHandlerTest, cls).setUp()
        app = cls.webapp2.WSGIApplication(
            [("/api/calendar/event/(.*)", EventHandler),
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)
        initModels(cls)


    @patch('utils.verify_token', return_value={'email': 'user@gmail.com'})
    def test_delete(self, verify_token):
        """Test the event_handler's delete method."""

        # Call the delete method
        self.testapp.delete("/api/calendar/event/%s" % self.event.key.urlsafe())
        # Refresh mayza_post
        self.event = self.event.key.get()
        # Verify if after delete the state of event is deleted
        self.assertEqual(self.event.state, "deleted" ,
                         "The state expected was deleted.")

    def tearDown(cls):
        """Deactivate the test."""
        cls.test.deactivate()


def initModels(cls):
    """Init the models."""
    # new User user
    cls.user = User()
    cls.user.name = 'user name'
    cls.user.cpf = '089.675.908-90'
    cls.user.email = 'user@gmail.com'
    cls.user.put()
    # new Institution CERTBIO
    cls.certbio = Institution()
    cls.certbio.name = 'CERTBIO'
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
    cls.event.institution_key = cls.certbio.key
    cls.event.start_time = datetime.datetime.now()
    cls.event.end_time = datetime.datetime.now()
    cls.event.local = "Event location"
    cls.event.put()
