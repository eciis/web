# -*- coding: utf-8 -*-
"""Post Collection handler test."""

import json
import datetime
import mocks
from test_base_handler import TestBaseHandler
from models import User
from models import Institution
from models.post import Post
from models import Event
from handlers.post_collection_handler import PostCollectionHandler
from google.appengine.ext import ndb
from mock import patch, call


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

        # create models
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
        cls.user.add_institution(cls.institution.key)
        cls.institution.follow(cls.other_user.key)
        cls.institution.put()
        # POST 
        cls.post = mocks.create_post(cls.user.key, cls.institution.key)
        cls.post.last_modified_by = cls.user.key
        cls.post.put()
        # Update Institution
        cls.institution.posts.append(cls.post.key)
        cls.institution.followers.append(cls.user.key)
        cls.institution.put()
        # Update User
        cls.user.posts.append(cls.post.key)
        cls.user.add_institution(cls.institution.key)
        cls.post.put()
        # body for post method
        post_data = {
            'title': 'new post',
            'institution': cls.institution.key.urlsafe(),
            'text': 'testing new post'
        }
        cls.body = {
            'post': post_data
        }


    @patch('handlers.post_collection_handler.enqueue_task')
    @patch('utils.verify_token', return_value={'email': 'user@email.com'})
    def test_post(self, verify_token, enqueue_task):
        """Test the post_collection_handler's post method."""

        # Make the request and assign the answer to post
        post = self.testapp.post_json("/api/posts", self.body,
            headers={'institution-authorization': self.institution.key.urlsafe()})
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
        # Check if the post's attributes are the expected
        self.assertEqual(post_obj.title, 'new post',
                         "The title expected was new post")
        self.assertEqual(post_obj.institution, self.institution.key,
                         "The post's institution is not the expected one")
        self.assertEqual(post_obj.text,
                         'testing new post',
                         "The post's text is not the expected one")

        calls = [
            call(
                "add-post-institution",
                {
                    'institution_key': self.institution.key.urlsafe(),
                    'created_post_key': post.get('key')
                }
            ),
            call(
                'notify-followers',
                {
                    'sender_key': self.user.key.urlsafe(),
                    'entity_key': key_post.urlsafe(),
                    'entity_type': 'POST',
                    'institution_key': self.institution.key.urlsafe(),
                    'current_institution': self.institution.key.urlsafe()
                }
            )
        ]

        # assert that add post to institution was sent to the queue
        enqueue_task.assert_has_calls(calls)

        with self.assertRaises(Exception) as raises_context:
            self.body['post'] = {
                'institution': self.institution.key.urlsafe(),
                'text': 'testing another post'
            }
            self.testapp.post_json("/api/posts", self.body,
                headers={'institution-authorization': self.institution.key.urlsafe()})

        exception_message = self.get_message_exception(str(raises_context.exception))
        expected_message = "Error! Title can not be empty"
        self.assertEqual(
            exception_message,
            expected_message,
            "Expected exception should be %s but was %s" % (expected_message, exception_message)
        )

        with self.assertRaises(Exception) as raises_context:
            self.body['post'] = {
                'institution': self.institution.key.urlsafe(),
                'title': 'testing another post'
            }
            self.testapp.post_json("/api/posts", self.body,
                headers={'institution-authorization': self.institution.key.urlsafe()})

        exception_message = self.get_message_exception(str(raises_context.exception))
        self.assertEqual(
            exception_message,
            "Error! Text can not be empty",
            "Excpected exception message must be equal to text"
        )

    @patch('handlers.post_collection_handler.enqueue_task')
    @patch('utils.verify_token', return_value={'email': 'user@email.com'})
    def test_post_sharing(self, verify_token, enqueue_task):
        """Test the post_collection_handler's post method."""
        # Make the request and assign the answer to post
        self.body['post'] = {
            'institution': self.institution.key.urlsafe(),
            'shared_post': self.post.key.urlsafe()
        }
        post = self.testapp.post_json("/api/posts", self.body,
            headers={'institution-authorization': self.institution.key.urlsafe()}).json
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
        
        calls = [
            call(
                "add-post-institution",
                {
                    'institution_key': self.institution.key.urlsafe(),
                    'created_post_key': key_post.urlsafe()
                }
            ),
            call(
                'notify-followers',
                {
                    'sender_key': self.user.key.urlsafe(),
                    'entity_key': post.get('key'),
                    'entity_type': 'POST',
                    'institution_key': self.institution.key.urlsafe(),
                    'current_institution': self.institution.key.urlsafe()
                }
            ),
            call(
                'post-notification',
                {
                    'receiver_key': self.post.author.urlsafe(),
                    'sender_key': self.user.key.urlsafe(),
                    'entity_key': self.post.key.urlsafe(),
                    'entity_type': 'SHARED_POST',
                    'current_institution': self.institution.key.urlsafe(),
                    'sender_institution_key': self.post.institution.urlsafe()
                }
            )
        ]

        # check if the notification was sent to the post's author
        enqueue_task.assert_has_calls(calls)

    @patch('handlers.post_collection_handler.enqueue_task')
    @patch('handlers.post_collection_handler.send_message_notification')
    @patch('utils.verify_token', return_value={'email': 'user@email.com'})
    def test_post_shared_event(self, verify_token, send_message_notification, enqueue_task):
        """Test the post_collection_handler's post method in case that post is shared_event."""
        # create an event
        event = mocks.create_event(self.other_user, self.institution)
        event.text = "Description of new Event"
        event.put()
        # Make the request and assign the answer to post
        self.body['post'] = {
            'institution': self.institution.key.urlsafe(),
            'shared_event': event.key.urlsafe()
        }
        post = self.testapp.post_json("/api/posts", self.body,
            headers={'institution-authorization': self.institution.key.urlsafe()}).json
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
        # Check if the post's attributes are the expected
        self.assertEqual(post_obj.institution, self.institution.key,
                         "The post's institution is not the expected one")

        shared_event_obj = post['shared_event']

        # Check if the shared_post's attributes are the expected
        self.assertEqual(shared_event_obj['title'], event.title,
                         "The post's title expected is New Event")
        self.assertEqual(shared_event_obj['institution_key'],
                         self.institution.key.urlsafe(),
                         "The post's institution expected is %s" % self.institution.key.urlsafe())
        self.assertEqual(shared_event_obj['author_key'],
                         self.other_user.key.urlsafe(),
                         "The post's institution expected is %s" % self.other_user.key.urlsafe())
        self.assertEqual(shared_event_obj['text'],
                         event.text,
                         "The post's text expected is %s" % event.text)

        calls = [
            call(
                "add-post-institution",
                {
                    'institution_key': self.institution.key.urlsafe(),
                    'created_post_key': post_obj.key.urlsafe()
                }
            ),
            call(
                'notify-followers',
                {
                    'sender_key': self.user.key.urlsafe(),
                    'entity_key': key_post.urlsafe(),
                    'entity_type': 'POST',
                    'institution_key': self.institution.key.urlsafe(),
                    'current_institution': self.institution.key.urlsafe()
                }
            )
        ]

        message = {
            "from": {
                "photo_url": self.user.photo_url,
                "name": self.user.name,
                "institution_name": event.institution_key.get().name
            },
            "to": {
                "institution_name": ""
            },
            "current_institution": {
                "name": self.institution.name
            }
        }

        # assert the notifiction was sent to the institution followers
        send_message_notification.assert_called_with(
            receiver_key=event.author_key.urlsafe(),
            notification_type="SHARED_EVENT",
            entity_key=key_post.urlsafe(),
            message=json.dumps(message)
        )
        # assert that add post to institution was sent to the queue        
        enqueue_task.assert_has_calls(calls)
    
    @patch('handlers.post_collection_handler.enqueue_task')
    @patch('handlers.post_collection_handler.send_message_notification')
    @patch('utils.verify_token', return_value={'email': 'user@email.com'})
    def test_post_survey(self, verify_token, send_message_notification, enqueue_task):
        """Test post method."""
        # Survey post
        options = [
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
        survey_post = {
            'institution': self.institution.key.urlsafe(),
            'title': 'Survey with Multiple choice',
            'text': 'Description of survey',
            'type_survey': 'multiple_choice',
            'deadline': '2020-07-25T12:30:15',
            'options': options
        }
        # Make the request and assign the answer to post method
        self.body['post'] = survey_post
        survey = self.testapp.post_json("/api/posts", self.body,
            headers={'institution-authorization': self.institution.key.urlsafe()})
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

        calls = [
            call(
                "add-post-institution",
                {
                    'institution_key': self.institution.key.urlsafe(),
                    'created_post_key': survey_obj.key.urlsafe()
                }
            ),
            call(
                'notify-followers',
                {
                    'sender_key': self.user.key.urlsafe(),
                    'entity_key': key_survey.urlsafe(),
                    'entity_type': 'SURVEY_POST', 
                    'institution_key': self.institution.key.urlsafe(),
                    'current_institution': self.institution.key.urlsafe()
                }
            )
        ]

        enqueue_task.assert_has_calls(calls)
