# -*- coding: utf-8 -*-
"""Send push notification handler test."""

from ..test_base_handler import TestBaseHandler, has_permissions
from push_notification import SendPushNotificationHandler, get_notification_props, NotificationType
import json
from .. import mocks
from mock import patch

MAIN_URI = '/api/queue/send-push-notification'


class SendPushNotificationHandlerTest(TestBaseHandler):
    """Test Remove admin permission in institution hierarchy."""

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(SendPushNotificationHandlerTest, cls).setUp()
        app = cls.webapp2.WSGIApplication(
            [
                (MAIN_URI,
                 SendPushNotificationHandler)
            ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)
    
    @patch('push_notification.send_push_notification_worker_handler.User.get_active_user')
    @patch('push_notification.send_push_notification_worker_handler.notify_multiple_users')
    def test_send_notification_with_regular_receivers(self, notify, get_user):
        """Test if the notify's method is called
        properly with the regular receivers."""
        user = mocks.create_user()
        inst = mocks.create_institution()
        post = mocks.create_post(user.key, inst.key)
        post.add_subscriber(user)
        notification_type = 'LIKE_POST'

        body = {
            'type': notification_type,
            'receivers': [user.key.urlsafe()],
            'entity': post.key.urlsafe()
        }

        self.testapp.post(MAIN_URI, body)

        props = get_notification_props(NotificationType(notification_type), post)

        notify.assert_called_with(props, [user.key.urlsafe()])
        get_user.assert_not_called()
    
    @patch('push_notification.send_push_notification_worker_handler.User.get_active_user')
    @patch('push_notification.send_push_notification_worker_handler.notify_multiple_users')
    def test_send_notification_with_invites(self, notify, get_user):
        """Test if the notify's method is called
        properly without the receivers as parameter."""
        user = mocks.create_user()
        inst = mocks.create_institution()
        post = mocks.create_post(user.key, inst.key)
        post.add_subscriber(user)
        notification_type = 'USER'
        f_invite = mocks.create_invite(user, inst.key, 'USER')
        s_user = mocks.create_user()
        s_invite = mocks.create_invite(s_user, inst.key, 'USER')
        user.state = 'active'
        s_user.state = 'active'
        user.put()
        s_user.put()

        invites = [f_invite.make(), s_invite.make()]
        body = {
            'type': notification_type,
            'invites': json.dumps(map(lambda invite: invite['key'], invites))
        }

        self.testapp.post(MAIN_URI, body)

        notify.assert_called()
        get_user.assert_called()
    
