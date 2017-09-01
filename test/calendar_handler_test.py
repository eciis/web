# -*- coding: utf-8 -*-
"""Calendar handler test."""

from test_base_handler import TestBaseHandler
from models.user import User
from models.institution import Institution
from handlers.calendar_handler import CalendarHandler
from google.appengine.ext import ndb
import json

from mock import patch


class CalendarHandlerTest(TestBaseHandler):
    """Post Collection handler test."""

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(CalendarHandlerTest, cls).setUp()
        app = cls.webapp2.WSGIApplication(
            [("/api/calendar", CalendarHandler),
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)
        initModels(cls)

    @patch('utils.verify_token', return_value={'email': 'user@gmail.com'})
    def test_post(self, verify_token):
        """Test the calendar_handler's post event method."""

        # Make the request and assign the answer to post
        event = self.testapp.post_json("/api/calendar", {
            'title': 'new event',
            'institution_key': self.certbio.key.urlsafe(),
            'text': 'testing new event',
            'start_time': '20271224102548',
            'end_time': '20271225102548',
            'local': 'local do evento'})
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

        # Check if raise exception when the end time of event is before the start time
        with self.assertRaises(Exception):
            self.testapp.post_json("/api/calendar", {
                'title': 'new event',
                'institution_key': self.certbio.key.urlsafe(),
                'text': 'testing new event',
                'start_time': '20271224102548',
                'end_time': '20271220102548',
                'local': 'local do evento'})

        # Check if raise exception when the end time of event is before today
        with self.assertRaises(Exception):
            self.testapp.post_json("/api/calendar", {
                'title': 'new event',
                'institution_key': self.certbio.key.urlsafe(),
                'text': 'testing new event',
                'start_time': '20101224102548',
                'end_time': '20271220102548',
                'local': 'local do evento'})

def initModels(cls):
    """Init the models."""
    # new User user
    cls.user = User()
    cls.user.name = 'user name'
    cls.user.cpf = '089.675.908-90'
    cls.user.email = 'user@gmail.com'
    cls.user.institutions = []
    cls.user.follows = []
    cls.user.institutions_admin = []
    cls.user.notifications = []
    cls.user.posts = []
    cls.user.put()
    # new Institution CERTBIO
    cls.certbio = Institution()
    cls.certbio.name = 'CERTBIO'
    cls.certbio.acronym = 'CERTBIO'
    cls.certbio.cnpj = '18.104.068/0001-86'
    cls.certbio.legal_nature = 'public'
    cls.certbio.address = 'Universidade Federal de Campina Grande'
    cls.certbio.occupation_area = ''
    cls.certbio.description = 'Ensaio Químico - Determinação de Material Volátil por \
            Gravimetria e Ensaio Biológico - Ensaio de Citotoxicidade'
    cls.certbio.email = 'certbio@ufcg.edu.br'
    cls.certbio.phone_number = '(83) 3322 4455'
    cls.certbio.members = [cls.user.key]
    cls.certbio.followers = [cls.user.key]
    cls.certbio.posts = []
    cls.certbio.admin = cls.user.key
    cls.certbio.put()

    """ Update User."""
    cls.user.add_institution(cls.certbio.key)
    cls.user.put()
