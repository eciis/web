# -*- coding: utf-8 -*-

from ..test_base import TestBase

from models.survey_post import SurveyPost
from models.user import User
from models.institution import Institution


class SurveyPostTest(TestBase):
    """Test the survey post model."""

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
        """Test the create method."""
        survey_binary = SurveyPost.create(
            self.data_binary, self.user.key, self.institution.key)

        self.assertEquals(
            survey_binary.title, 'Survey with Binary choice',
            "It should be 'Survey with Binary choice'"
        )
        self.assertEquals(
            survey_binary.text, 'Description of survey',
            "It should be 'Description of survey'"
        )
        self.assertEquals(
            survey_binary.type_survey, 'binary',
            "It should be 'binary'"
        )
        self.assertEquals(
            survey_binary.options, self.options,
            "It should be equal to options"
        )

    def test_is_vote_valid(self):
        """Test the is_valid method."""
        frist_vote = self.data_binary["options"][0]
        second_vote = self.data_binary["options"][1]
        survey_binary = SurveyPost.create(
            self.data_binary, self.user.key, self.institution.key)
        survey_multiple = SurveyPost.create(
            self.data_multiple, self.user.key, self.institution.key)

        self.assertEquals(
            survey_binary.is_vote_valid(self.user.key, frist_vote),
            True, "It should be True"
        )

        self.assertEquals(
            survey_multiple.is_vote_valid(self.user.key, second_vote),
            True, "It should be True"
        )


def initModels(cls):
    """Init the models."""
    # new User
    cls.user = User()
    cls.user.name = 'User'
    cls.user.email = ['user@gmail.com']
    cls.user.institutions = []
    cls.user.posts = []
    cls.user.put()

    # new Institution inst test
    cls.institution = Institution()
    cls.institution.name = 'inst test'
    cls.institution.members = [cls.user.key]
    cls.institution.admin = cls.user.key
    cls.institution.put()

    cls.user.institutions = [cls.institution.key]
    cls.user.put()

    cls.options = [
        {'text': 'frist option',
         'number_votes': 0,
         'voters': []
         },
        {'text': 'second option',
         'number_votes': 0,
         'voters': []
         }]

    cls.data_binary = {
        'title': 'Survey with Binary choice',
        'text': 'Description of survey',
        'type_survey': 'binary',
        'deadline': '2020-07-25T12:30:15',
        'options': cls.options
    }

    cls.data_multiple = {
        'title': 'Survey with Multiple choice',
        'text': 'Description of survey',
        'type_survey': 'multiple_choice',
        'deadline': '2020-07-25T12:30:15',
        'options': cls.options
    }
