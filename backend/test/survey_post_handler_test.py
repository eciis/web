# -*- coding: utf-8 -*-
"""Survey Post handler test."""

from test_base_handler import TestBaseHandler
from models.survey_post import SurveyPost
from models.user import User
from models.institution import Institution
from models.post import Comment
from handlers.post_handler import PostHandler

from mock import patch


class SurveyPostHandlerTest(TestBaseHandler):
    """Test the post_handler class."""

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(SurveyPostHandlerTest, cls).setUp()
        app = cls.webapp2.WSGIApplication(
            [("/api/surveyposts/(.*)", PostHandler),
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)
        initModels(cls)

    @patch('utils.verify_token', return_value={'email': 'user@gmail.com'})
    def test_delete(self, verify_token):
        """Test delete method."""
        # test delete post when the post has a comment
        # Verify if before the delete the post's state is published
        self.assertEqual(self.user_post.state, 'published',
                         "The post's state must be published")
        self.testapp.delete("/api/surveyposts/%s" % self.user_post.key.urlsafe())
        # Retrieve the post from the datastore, once it has been changed
        self.user_post = self.user_post.key.get()
        # Make sure the post's state is deleted
        self.assertEqual(self.user_post.state, 'deleted',
                         "The post's state must be deleted")

    def tearDown(cls):
        """Deactivate the test."""
        cls.test.deactivate()


def initModels(cls):
    """Init the models."""
    # new User user
    cls.user = User()
    cls.user.name = 'user'
    cls.user.email = ['user@gmail.com']
    cls.user.put()

    # new Institution
    cls.institution = Institution()
    cls.institution.name = 'institution'
    cls.institution.members = [cls.user.key]
    cls.institution.followers = [cls.user.key]
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
        'title': 'Survey with Multiple choice',
        'text': 'Description of survey',
        'type_survey': 'multiple_choice',
        'deadline': '2020-07-25T12:30:15',
        'options': cls.options
    }

    # Survey Post of user To Institution
    cls.user_post = SurveyPost.create(cls.survey_post, cls.user.key, cls.institution.key)
    cls.user_post.author = cls.user.key
    cls.user_post.institution = cls.institution.key
    cls.user_post.put()

    # update institution's posts
    cls.institution.posts = [cls.user_post.key]
    cls.institution.put()
