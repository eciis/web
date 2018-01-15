# -*- coding: utf-8 -*-
"""Post Collection handler test."""

import json
import datetime
import mocks
from test_base_handler import TestBaseHandler
from models.user import User
from models.institution import Institution
from models.post import Post
from models.event import Event
from handlers.post_collection_handler import PostCollectionHandler
from google.appengine.ext import ndb
from mock import patch


class PostCollectionHandlerTest(TestBaseHandler):
    """Post Collection handler test."""

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(PostCollectionHandlerTest, cls).setUp()
        app = cls.webapp2.WSGIApplication(
            [("/api/posts", PostCollectionHandler),
             ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)
        initModels(cls)

    @patch('handlers.post_collection_handler.enqueue_task')
    @patch('handlers.post_collection_handler.send_message_notification')
    @patch('utils.verify_token', return_value={'email': 'user@email.com'})
    def test_post(self, verify_token, send_message_notification, enqueue_task):
        """Test the post_collection_handler's post method."""

        # Make the request and assign the answer to post
        post = self.testapp.post_json("/api/posts", self.body)
        # Retrieve the entities
        post = json.loads(post._app_iter[0])
        key_post = ndb.Key(urlsafe=post['key'])
        post_obj = key_post.get()
        self.institution = self.institution.key.get()
        self.user = self.user.key.get()
        # Check class object
        self.assertEqual(post_obj._class_name(), 'Post',
                         "The class of post is 'Post'")
        # Check if the post's key is in institution and user
        self.assertTrue(key_post in self.user.posts,
                        "The post is not in user.posts")
        self.assertTrue(key_post in self.user.posts,
                        "The post is not in institution.posts")
        # Check if the post's attributes are the expected
        self.assertEqual(post_obj.title, 'new post',
                         "The title expected was new post")
        self.assertEqual(post_obj.institution, self.institution.key,
                         "The post's institution is not the expected one")
        self.assertEqual(post_obj.text,
                         'testing new post',
                         "The post's text is not the expected one")

        # assert the notification was sent to the institution followers
        send_message_notification.assert_called_with(
            self.other_user.key.urlsafe(),
            self.user.key.urlsafe(),
            "POST",
            key_post.urlsafe(),
            self.body.get('currentInstitution')
        )
        # assert that no shared post notification was sent
        enqueue_task.assert_not_called()

        with self.assertRaises(Exception) as raises_context:
            self.body['post'] = {
                'institution': self.institution.key.urlsafe(),
                'text': 'testing another post'
            }
            self.testapp.post_json("/api/posts", self.body)

        exception_message = self.get_message_exception(str(raises_context.exception))
        self.assertEqual(
            exception_message,
            "Title can not be empty",
            "Excpected exception message must be equal to title"
        )

        with self.assertRaises(Exception) as raises_context:
            self.body['post'] = {
                'institution': self.institution.key.urlsafe(),
                'title': 'testing another post'
            }
            self.testapp.post_json("/api/posts", self.body)

        exception_message = self.get_message_exception(str(raises_context.exception))
        self.assertEqual(
            exception_message,
            "Text can not be empty",
            "Excpected exception message must be equal to text"
        )

    @patch('handlers.post_collection_handler.enqueue_task')
    @patch('handlers.post_collection_handler.send_message_notification')
    @patch('utils.verify_token', return_value={'email': 'user@email.com'})
    def test_post_sharing(self, verify_token, send_message_notification, enqueue_task):
        """Test the post_collection_handler's post method."""
        # Make the request and assign the answer to post
        self.body['post'] = {
            'institution': self.institution.key.urlsafe(),
            'shared_post': self.post.key.urlsafe()
        }
        post = self.testapp.post_json("/api/posts", self.body).json
        # Retrieve the entities
        key_post = ndb.Key(urlsafe=post['key'])
        post_obj = key_post.get()
        self.institution = self.institution.key.get()
        self.user = self.user.key.get()
        # Check class object
        self.assertEqual(post_obj._class_name(), 'Post',
                         "The class of post is 'Post'")
        # Check if the post's key is in institution and user
        self.assertTrue(key_post in self.user.posts,
                        "The post is not in user.posts")
        self.assertTrue(key_post in self.institution.posts,
                        "The post is not in institution.posts")
        # Check if the post's attributes are the expected
        self.assertEqual(post_obj.institution, self.institution.key,
                         "The post's institution is not the expected one")

        shared_post_obj = post['shared_post']

        # Check if the shared_post's attributes are the expected
        self.assertEqual(shared_post_obj['title'], self.post.title,
                         "The post's title expected is %s" % self.post.title)
        self.assertEqual(shared_post_obj['institution_key'], self.institution.key.urlsafe(),
                         "The post's institution expected is certbio")
        self.assertEqual(shared_post_obj['text'],
                         self.post.text,
                         "The post's text expected is '%s'" % self.post.text)

        # check if the notification was sent to the institution's followers
        send_message_notification.assert_called_with(
            self.other_user.key.urlsafe(),
            self.user.key.urlsafe(),
            "POST",
            key_post.urlsafe(),
            self.body.get('currentInstitution')
        )
        # check if the notification was sent to the post's author
        enqueue_task.assert_called_with(
            "post-notification",
            {
                'receiver_key': self.post.author.urlsafe(),
                'sender_key': self.user.key.urlsafe(),
                'entity_key': post.get('key'),
                'entity_type': 'SHARED_POST',
                'current_institution': json.dumps(self.body.get('currentInstitution'))
            }
        )

    @patch('utils.verify_token', return_value={'email': 'user@email.com'})
    def test_post_shared_event(self, verify_token):
        """Test the post_collection_handler's post method in case that post is shared_event."""
        # Make the request and assign the answer to post
        self.body['post'] = {
            'institution': self.institution.key.urlsafe(),
            'shared_event': self.event.key.urlsafe()
        }
        post = self.testapp.post_json("/api/posts", self.body).json
        # Retrieve the entities
        key_post = ndb.Key(urlsafe=post['key'])
        post_obj = key_post.get()
        self.institution = self.institution.key.get()
        self.user = self.user.key.get()
        # Check class object
        self.assertEqual(post_obj._class_name(), 'Post',
                         "The class of post is 'Post'")
        # Check if the post's key is in institution and user
        self.assertTrue(key_post in self.user.posts,
                        "The post is not in user.posts")
        self.assertTrue(key_post in self.institution.posts,
                        "The post is not in institution.posts")
        # Check if the post's attributes are the expected
        self.assertEqual(post_obj.institution, self.institution.key,
                         "The post's institution is not the expected one")

        shared_event_obj = post['shared_event']

        # Check if the shared_post's attributes are the expected
        self.assertEqual(shared_event_obj['title'], "New Event",
                         "The post's title expected is New Event")
        self.assertEqual(shared_event_obj['institution_key'],
                         self.institution.key.urlsafe(),
                         "The post's institution expected is certbio")
        self.assertEqual(shared_event_obj['author_key'],
                         self.user.key.urlsafe(),
                         "The post's institution expected is certbio")
        self.assertEqual(shared_event_obj['text'],
                         "Description of new Event",
                         "The post's text expected is Post inicial que quero compartilhar")

    @patch('utils.verify_token', return_value={'email': 'user@email.com'})
    def test_post_survey(self, verify_token):
        """Test post method."""
        # Make the request and assign the answer to post method
        self.body['post'] = self.survey_post
        survey = self.testapp.post_json("/api/posts", self.body)
        # Retrieve the entities
        survey = json.loads(survey._app_iter[0])
        key_survey = ndb.Key(urlsafe=survey['key'])
        survey_obj = key_survey.get()
        self.institution = self.institution.key.get()
        self.user = self.user.key.get()

        # Check class object
        self.assertEqual(survey_obj._class_name(), 'SurveyPost',
                         "The class of post is 'SurveyPost'")
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
    cls.user = mocks.create_user('user@email.com')
    cls.user.photo_url = 'urlphoto'
    cls.user.put()
    # new User
    cls.other_user = mocks.create_user('user@email.com')
    cls.other_user.photo_url = 'urlphoto'
    cls.user.put()
    # new Institution 
    cls.institution = mocks.create_institution()
    cls.institution.photo_url = 'urlphoto'
    cls.institution.admin = cls.user.key
    cls.institution.follow(cls.other_user.key)
    cls.institution.put()
    # POST 
    cls.post = mocks.create_post(cls.user.key, cls.institution.key)
    cls.post.last_modified_by = cls.user.key
    cls.post.put()

    """ Update Institution."""
    cls.institution.posts.append(cls.post.key)
    cls.institution.followers.append(cls.user.key)
    cls.institution.put()

    """ Update User."""
    cls.user.posts.append(cls.post.key)
    cls.user.add_institution(cls.institution.key)
    cls.post.put()

    # Events
    cls.event = Event()
    cls.event.title = "New Event"
    cls.event.text = "Description of new Event"
    cls.event.author_key = cls.user.key
    cls.event.author_name = cls.user.name
    cls.event.author_photo = cls.user.photo_url
    cls.event.institution_key = cls.institution.key
    cls.event.institution_name = cls.institution.name
    cls.event.institution_image = cls.institution.photo_url
    cls.event.start_time = datetime.datetime.now()
    cls.event.end_time = datetime.datetime.now()
    cls.event.local = "Event location"
    cls.event.put()

    # Survey post
    cls.options = [
        {'id': 0,
         'text': 'first option',
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
    # body for post method
    post_data = {
        'title': 'new post',
        'institution': cls.institution.key.urlsafe(),
        'text': 'testing new post'
    }
    current_institution = { 'name': 'current_institution' }
    cls.body = {
        'post': post_data,
        'currentInstitution': current_institution
    }
