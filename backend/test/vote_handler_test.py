# -*- coding: utf-8 -*-
"""Like Post handler test."""
from test_base_handler import TestBaseHandler
from models import SurveyPost
from models import User
from models import Institution
from handlers.vote_handler import VoteHandler
import datetime

from mock import patch


class VoteHandlerTest(TestBaseHandler):
    """Test the handler like_post_handler."""

    VOTE_URI = "/api/surveyposts/%s/votes"

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(VoteHandlerTest, cls).setUp()
        app = cls.webapp2.WSGIApplication(
            [("/api/surveyposts/(.*)/votes", VoteHandler),
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)
        initModels(cls)

    @patch('util.login_service.verify_token')
    def test_post(self, verify_token):
        """Test the vote_handler's post method."""
        verify_token.return_value = {'email': 'user@example.com'}
        # Verify options's number_votes
        self.assertEqual(self.user_post.number_votes, 0,
                         "The number of votes expected was 0")

        # Call the post method
        self.testapp.post_json(self.VOTE_URI % self.user_post.key.urlsafe(),
                               [self.user_post.options[0]])

        # Verify objects
        self.user_post = self.user_post.key.get()
        option = self.user_post.options[0]
        self.assertEqual(self.user_post.number_votes, 1,
                         "The number of votes expected was 1")
        self.assertEqual(option['number_votes'], 1,
                         "The number of votes expected was 1")

        # Call the post method again
        with self.assertRaises(Exception) as exc:
            self.testapp.post_json(self.VOTE_URI % self.user_post.key.urlsafe(),
                                   [self.user_post.options[0]])
        # Verify if message exception
        exc = self.get_message_exception(exc.exception.message)
        self.assertEquals(exc, "Error! You've already voted in this survey")
        # Refresh user_post
        self.user_post = self.user_post.key.get()
        self.assertEqual(self.user_post.number_votes, 1,
                         "The number of votes expected was 1")
        self.assertEqual(option['number_votes'], 1,
                         "The number of votes expected was 1")

    @patch('util.login_service.verify_token')
    def test_invalid_post(self, verify_token):
        """Test the vote_handler's post method."""
        verify_token.return_value = {'email': 'user@example.com'}
        self.user_post.voters.append(self.user.key)
        self.user_post.put()

        with self.assertRaises(Exception) as ex:
            self.testapp.post_json(self.VOTE_URI % self.user_post.key.urlsafe(),
                                [self.user_post.options[0]])

        message = self.get_message_exception(ex.exception.message)

        self.assertEqual(message, "Error! You've already voted in this survey")

    def tearDown(cls):
        """Deactivate the test."""
        cls.test.deactivate()


def initModels(cls):
    """Init the models."""
    # new User User
    cls.user = User()
    cls.user.name = 'User'
    cls.user.email = ['user@example.com']
    cls.user.put()
    # new Institution SPLAB
    cls.institution = Institution()
    cls.institution.name = 'SPLAB'
    cls.institution.email = 'institution@example.com'
    cls.institution.members = [cls.user.key]
    cls.institution.followers = [cls.user.key]
    cls.institution.admin = cls.user.key
    cls.institution.state = 'active'
    cls.institution.put()
    # Survey post of User To SPLAB
    cls.user_post = SurveyPost()
    cls.user_post.author = cls.user.key
    cls.user_post.institution = cls.institution.key
    cls.user_post.type_survey = 'binary'
    cls.user_post.title = 'Survey with Multiple choice'
    cls.user_post.text = 'Description of survey'
    cls.user_post.number_votes = 0
    cls.user_post.last_modified_by = cls.user.key
    cls.user_post.deadline = datetime.datetime(2020, 07, 25, 12, 30, 15)
    cls.user_post.options = [{'id': 0,
                              'text': 'first option',
                              'number_votes': 0,
                              'voters': []
                              },
                             {'id': 1,
                                 'text': 'second option',
                                 'number_votes': 0,
                                 'voters': []
                              }]
    cls.user_post.put()
