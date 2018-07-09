"""Instituion Parent Handler."""

from google.appengine.ext import ndb

from utils import Utils
from util import login_required, Notification, NotificationsQueueManager
from utils import json_response
from custom_exceptions import NotAuthorizedException
from custom_exceptions import EntityException
from send_email_hierarchy import RequestLinkEmailSender

from models import Institution

from service_messages import send_message_notification, create_system_message
from service_entities import enqueue_task
from util import get_subject

from . import BaseHandler

__all__ = ['InstitutionParentHandler']

def create_system_notification(receiver_institution_key, receiver_key):
    """
    Create new system notification and add in queue.
    
    Keyword arguments:
    receiver_institution_key -- Institution key in which the notification is directed.
    receiver_key -- User key that notification will be sent.
    """
    message = create_system_message(receiver_institution_key)

    notification = Notification(
        message=message,
        entity_key=receiver_institution_key.urlsafe(),
        notification_type='ADD_ADM_PERMISSIONS',
        receiver_key=receiver_key
    )

    notification_id = NotificationsQueueManager.create_notification_task(notification)
    return notification_id


class InstitutionParentHandler(BaseHandler):
    """Institution Parent Handler."""

    @json_response
    @login_required
    @ndb.transactional(xg=True)
    def delete(self, user, institution_parent_urlsafe, institution_children_urlsafe):
        """
        Handle delete children link between institutions.

        This handler remove the children link between two institutions. 
        """
        # holds the reference of the parent intitution.
        institution_parent = ndb.Key(urlsafe=institution_parent_urlsafe).get() 
        # holds the reference of the child intitution.
        institution_children = ndb.Key(urlsafe=institution_children_urlsafe).get()

        Utils._assert(not type(institution_parent) is Institution,
                      "Key is not an institution", EntityException)
        Utils._assert(not type(institution_children) is Institution,
                      "Key is not an institution", EntityException)

        user.check_permission('remove_link',
                              "User is not allowed to remove link between institutions",
                              institution_parent_urlsafe)

        is_parent = False
        institution_parent.remove_link(institution_children, is_parent)
        admin = institution_children.admin

        notification_type = 'REMOVE_INSTITUTION_LINK'
        notification_id = create_system_notification(
            institution_children.key,
            user.key.urlsafe(),
        )

        enqueue_task('remove-admin-permissions', {
            'institution_key': institution_children.key.urlsafe(), 
            'parent_key': institution_parent.key.urlsafe(),
            'notification_id': notification_id
        })

        email_sender = RequestLinkEmailSender(**{
            'institution_parent_name': institution_parent.name,
            'institution_parent_email': institution_parent.institutional_email,
            'institution_requested_key': institution_children.key.urlsafe(),
            'institution_child_name': institution_children.name,
            'institution_child_email': institution_children.institutional_email,
            'subject': get_subject('REMOVED_LINK_EMAIL'),
            'receiver': admin.get().email[0],
            'html': 'removed_institutional_link.html'
        })
        email_sender.send_email()

        notification_message = institution_parent.create_notification_message(user_key=user.key, current_institution_key=user.current_institution, 
            receiver_institution_key=institution_children.key, sender_institution_key=institution_parent.key)
        send_message_notification(
            receiver_key=admin.urlsafe(),
            notification_type=notification_type,
            entity_key=institution_children.key.urlsafe(),
            message=notification_message
        )
