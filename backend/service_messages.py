# -*- coding: utf-8 -*-
"""Service of send messages."""
import sys
from google.appengine.api import taskqueue

# TODO: remove this when the portugueses texts
# in emails are extracted from the code
# @author: Tiago Pereira
reload(sys)
sys.setdefaultencoding('utf8')


def send_message_notification(user_key, message, entity_type, entity_key):
    """Method of send notification.

    Keyword arguments:
    user_key -- key of user that will receive notification.
    messagem -- message of notification.
    entity_type -- type of notification.
    entity_key -- entity key of type invite.
    """
    taskqueue.add(
        url='/api/queue/send-notification',
        target='worker',
        queue_name='notifications',
        params={
            'user_key': user_key,
            'message': message,
            'entity_type': entity_type,
            'entity_key': entity_key
        }
    )


def send_message_email(invitee, body, subject):
    """Method of send email.

    Keywords arguments:
    invitee -- guest email.
    body -- message to be sent.
    """
    taskqueue.add(
        url='/api/queue/send-email',
        target='worker',
        queue_name='notifications',
        params={
            'invitee': invitee,
            'subject': subject,
            'body': body
        }
    )
