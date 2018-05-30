# -*- coding: utf-8 -*-
"""Service message test."""

from test_base_handler import TestBaseHandler
import service_messages
import mocks
import mock
import json


class ServiceMessageTest(TestBaseHandler):
    """Test the service message module."""

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(ServiceMessageTest, cls).setUp()

    def test_create_message(self):
        """Test create_message method."""
        sender = mocks.create_user()
        sender.photo_url = "photo-url"
        sender.put()
        institution = mocks.create_institution()
        current_institution = institution.key
        message = service_messages.create_message(sender.key, current_institution)
        expected_message = {
            'from': {
                'name': sender.name.encode('utf8'),
                'photo_url': sender.photo_url,
                'institution_name': ''
            },
            'to': {
                'institution_name': ''
            },
            'current_institution': {
                'name': institution.name
            }
        }

        self.assertEquals(
            message,
            json.dumps(expected_message),
            "The created message should be igual to the expected one but was: "+message
        )


    def test_create_entity_from_institution(self):
        """Test create_entity method when the entity_key is from an institutition."""
        institution = mocks.create_institution()
        entity = service_messages.create_entity(institution.key.urlsafe())
        expected_entity = {
            "key": institution.key.urlsafe()
        }

        self.assertEquals(
            entity,
            json.dumps(expected_entity),
            "The created entity should be equal to the expected one"
        )

    def test_create_entity_from_post(self):
        """Test create_entity method when the entity_key is from a post."""
        institution = mocks.create_institution()
        author = mocks.create_user()
        post = mocks.create_post(author.key, institution.key)
        entity = service_messages.create_entity(post.key.urlsafe())
        expected_entity = {
            "key": post.key.urlsafe()
        }

        self.assertEquals(
            entity,
            json.dumps(expected_entity),
            "The created entity should be equal to the expected one"
        )


    @mock.patch('service_messages.create_entity')
    @mock.patch('service_messages.taskqueue.add')
    def test_send_message_notification(self, taskqueue_add, create_entity):
        """Test send_message_notification method."""
        sender = mocks.create_user()
        sender.photo_url = "photo-url"
        sender.put()
        receiver = mocks.create_user()
        institution = mocks.create_institution()
        current_institution = { "name": institution.name }
        post = mocks.create_post(receiver.key, institution.key)
        notification_type = "LIKE_POST"
        expected_message = {
            'from': {
                'name': sender.name.encode('utf8'),
                'photo_url': sender.photo_url,
                'institution_name': institution.name
            },
            'to': {
                'institution_name': ''
            },
            'current_institution': current_institution
        }

        service_messages.send_message_notification(
            receiver_key=receiver.key.urlsafe(),
            notification_type=notification_type,
            entity_key=post.key.urlsafe(),
            message=expected_message
        )

        self.assertTrue(
            create_entity.called,
            "Should have called the create_entity method"
        )
        self.assertTrue(
            taskqueue_add.called,
            "Should have called the add method from taskqueue"
        )
