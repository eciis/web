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
        sender_key -- the user key of who is sending the notification
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
            'institution_name': sender_institution_key and sender_institution_key.get().name
        },
        'to': {
            'institution_name': receiver_institution_key and receiver_institution_key.get().name
        },
        'current_institution': {
            'name': current_institution_key and current_institution_key.get().name
        }
    }

    return json.dumps(message)

def create_entity(entity_key):
    """Create a short entity with only key and name."""
    entity_obj = ndb.Key(urlsafe=entity_key).get()
    class_name = entity_obj.__class__.__name__
    is_post = class_name == 'Post'
    is_institution = class_name == 'Institution'
    is_invite = 'Invite' in class_name
    is_request = 'Request' in class_name
    name = ''

    if is_post:
        institution = entity_obj.institution.get()
        name = institution.name
    elif is_institution:
        name = entity_obj.name
    elif is_invite or is_request:
        institution = entity_obj.institution_key.get()
        name = institution.name
    
    entity = {
        "key": entity_key,
        "institution_name": name
    }
    return json.dumps(entity)


def send_message_notification(receiver_key, entity_type, entity_key, message, entity=None):
    """Method of send notification.

    Keyword arguments:
    receiver_key -- key of user that will receive notification.
    message -- message of notification.
    entity_type -- type of notification.
    entity_key -- entity key of type invite.
    entity -- this parameter is useful when it's necessary to send the full entity to the notification for consistency reasons in the frontend
    """
    entity = entity or create_entity(entity_key)
    taskqueue.add(
        url='/api/queue/send-notification',
        target='worker',
        queue_name='notifications',
        params={
            'receiver_key': receiver_key,
            'message': message,
            'entity_type': entity_type,
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
