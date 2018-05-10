# -*- coding: utf-8 -*-
"""Service of send messages."""
import sys
import json
from google.appengine.ext import ndb
from google.appengine.api import taskqueue

# TODO: remove this when the portugueses texts
# in emails are extracted from the code
# @author: Tiago Pereira
reload(sys)
sys.setdefaultencoding('utf8')

def create_message(sender_key, current_institution_key=None, receiver_institution_key=None, sender_institution_key=None):
    """Create a message of notification.
    
        Keyword arguments:
        sender_key -- the key of the user who is sending the notification
        current_institution_key -- the institution the user was logged in when the notification was sent
        receiver_institution_key -- the institution that will receive the notification
        sender_institution_key -- the institution that the user made the action.
    """
    sender = sender_key.get()
    name = sender.name if sender.name != "Unknown" else sender.email[0]

    message = {
        'from': {
            'name': name.encode('utf8'),
            'photo_url': sender.photo_url,
            'institution_name': (sender_institution_key and sender_institution_key.get().name) or ''
        },
        'to': {
            'institution_name': (receiver_institution_key and receiver_institution_key.get().name) or ''
        },
        'current_institution': {
            'name': current_institution_key and current_institution_key.get().name
        }
    }

    return json.dumps(message)

def create_entity(entity_key):
    """Create a short entity with only key."""    
    entity = {
        "key": entity_key
    }
    return json.dumps(entity)


def send_message_notification(receiver_key, notification_type, entity_key, message, entity=None):
    """Method of send notification.

    Keyword arguments:
    receiver_key -- key of user that will receive notification.
    message -- message of notification.
    notification_type -- type of notification.
    entity_key -- entity key of type invite.
    entity -- this parameter is useful when it's necessary 
        to send the full entity to the notification for consistency reasons in the frontend
    """
    entity = entity or create_entity(entity_key)
    taskqueue.add(
        url='/api/queue/send-notification',
        target='worker',
        queue_name='notifications',
        params={
            'receiver_key': receiver_key,
            'message': message,
            'notification_type': notification_type,
            'entity': entity
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
