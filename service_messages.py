"""Service of send messages."""
from google.appengine.api import taskqueue


def send_message_notification(user_key, message, entity_type, entity_key):
    """Method of send notification."""
    taskqueue.add(
        url='/api/queue/send-notification',
        target='worker',
        params={
            'user_key': user_key,
            'message': message,
            'entity_type': entity_type,
            'entity_key': entity_key
        }
    )


def send_message_email(invitee, body):
    """Method of send email."""
    taskqueue.add(
        url='/api/queue/send-email',
        target='worker',
        params={
            'invitee': invitee,
            'subject': "Convite plataforma e-CIS",
            'body': body
        }
    )
