# -*- coding: utf-8 -*-
"""Send Invite Handler Tests."""

from ..test_base_handler import TestBaseHandler
from service_entities import enqueue_task
from util import NotificationsQueueManager
from worker import SendInviteHandler
from models import InviteUser, Invite
from mock import patch
from .. import mocks
import json


def create_invite(institution, admin, invitee):
    invite_user = InviteUser()
    invite_user.invitee = invitee
    invite_user.institution_key = institution.key
    invite_user.admin_key = admin.key
    invite_user.sender_name = admin.name
    invite_user.status = 'sent'
    invite_user.put()
    return invite_user

class SendInviteHandlerTest(TestBaseHandler):
    """Test Send Invite Handler."""

    @classmethod
    def setUp(cls):
        """Provide the base for the tests."""
        super(SendInviteHandlerTest, cls).setUp()
        app = cls.webapp2.WSGIApplication(
            [
                ('/api/queue/send-invite', SendInviteHandler)
            ], debug=True)
        cls.testapp = cls.webtest.TestApp(app)
    
    @patch('worker.notify_multiple_users', return_value={})
    @patch('worker.get_notification_props')
    @patch.object(NotificationsQueueManager, 'resolve_notification_task')
    @patch.object(Invite, 'send_invite')
    def test_post(self, send_invite, resolve_notification_task, get_props, notify):
        """Test post method."""
        admin = mocks.create_user()
        institution = mocks.create_institution()
        first_invite = create_invite(institution, admin, 'invitee01@email')
        second_invite = create_invite(institution, admin, 'invitee02@email')
        
        host = 'host:0000'
        notification_id = 'some_id'
        invites_keys = [
            first_invite.key.urlsafe(), 
            second_invite.key.urlsafe()
        ]

        request_url = '/api/queue/send-invite?invites_keys=%s&host=%s&current_institution=%s&notifications_ids=%s&type_of_invite=%s' % (
            json.dumps(invites_keys), host, institution.key.urlsafe(), notification_id, 'USER')

        self.testapp.post(request_url)

        for i in range(len(invites_keys)):
            send_invite.assert_called_with(host, institution.key)

        resolve_notification_task.assert_called_with(notification_id)

        notify.assert_called()
        get_props.assert_called_with('USER')
