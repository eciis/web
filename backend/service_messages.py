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

def create_message(sender_key, current_institution):
    """Create a message based on user current institution."""
    sender = ndb.Key(urlsafe=sender_key).get()
    name = sender.name if sender.name != "Unknown" else sender.email[0]
    if current_institution and current_institution is not type(None):
        institution_name = current_institution.get().name 
    else:
        institution_name = ""
    message = {
        'from': {
            'name': name.encode('utf8'),
            'photo_url': sender.photo_url,
            'institution_name': institution_name
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


def send_message_notification(receiver_key, sender_key, entity_type, entity_key, current_institution=None, entity=None):
    """Method of send notification.

    Keyword arguments:
    receiver_key -- key of user that will receive notification.
    sender_key -- the user key of who is sending the notification
    messagem -- message of notification.
    entity_type -- type of notification.
    entity_key -- entity key of type invite.
    current_institution -- the institution the user was logged in when the notification was sent
    """
    message = create_message(sender_key, current_institution)
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
