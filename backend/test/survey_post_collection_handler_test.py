# -*- coding: utf-8 -*-
"""Survey Post Collection handler test."""

from test_base_handler import TestBaseHandler
from models.user import User
from models.institution import Institution
from handlers.survey_post_collection_handler import SurveyPostCollectionHandler
from google.appengine.ext import ndb
import json

from mock import patch


class SurveyPostCollectionHandlerTest(TestBaseHandler):
    """Survey Post Collection handler test."""

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(SurveyPostCollectionHandlerTest, cls).setUp()
        app = cls.webapp2.WSGIApplication(
            [("/api/surveyposts", SurveyPostCollectionHandler),
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)
        initModels(cls)

    @patch('utils.verify_token', return_value={'email': 'user@gmail.com'})
    def test_post(self, verify_token):
        """Test post method."""

        # Make the request and assign the answer to post method
        survey = self.testapp.post_json("/api/surveyposts", self.survey_post)
        # Retrieve the entities
        survey = json.loads(survey._app_iter[0])
        key_survey = ndb.Key(urlsafe=survey['key'])
        survey_obj = key_survey.get()
        self.institution = self.institution.key.get()
        self.user = self.user.key.get()

        # Check if the survey post's key is in institution and user
        self.assertTrue(key_survey in self.user.posts,
                        "The post is not in user.posts")
        self.assertTrue(key_survey in self.institution.posts,
                        "The post is not in institution.posts")
        # Check if the survey post's attributes are the expected
        self.assertEqual(survey_obj.title, 'Survey with Multiple choice',
                         "The title expected was 'Survey with Multiple choice'")
        self.assertEqual(survey_obj.institution, self.institution.key,
                         "The survey_obj's institution is institution")
        self.assertEqual(survey_obj.text, 'Description of survey',
                         "The post's text is 'Description of survey'")
        self.assertEqual(survey_obj.type_survey, 'multiple_choice',
                         "The post's type is 'multiple_choice'")
        self.assertEqual(survey_obj.state, 'published',
                         "The post's state is 'published'")


def initModels(cls):
    """Init the models."""
    # new User
    cls.user = User()
    cls.user.name = 'User'
    cls.user.cpf = '089.675.908-90'
    cls.user.email = ['user@gmail.com']
    cls.user.photo_url = 'urlphoto'
    cls.user.institutions_admin = []
    cls.user.posts = []
    cls.user.put()
    # new Institution CERTBIO
    cls.institution = Institution()
    cls.institution.name = 'CERTBIO'
    cls.institution.email = 'certbio@ufcg.edu.br'
    cls.institution.photo_url = 'urlphoto'
    cls.institution.posts = []
    cls.institution.followers = []
    cls.institution.admin = cls.user.key
    cls.institution.put()
    # Survey post
    cls.options = [
        {'id': 0,
         'text': 'frist option',
         'number_votes': 0,
         'voters': []
         },
        {'id': 1,
         'text': 'second option',
         'number_votes': 0,
         'voters': []
         }]
    cls.survey_post = {
        'institution': cls.institution.key.urlsafe(),
        'title': 'Survey with Multiple choice',
        'text': 'Description of survey',
        'type_survey': 'multiple_choice',
        'deadline': '2020-07-25T12:30:15',
        'options': cls.options
    }

    """ Update Institution."""
    cls.institution.followers.append(cls.user.key)
    cls.institution.put()

    """ Update User."""
    cls.user.add_institution(cls.institution.key)
    cls.user.put()
