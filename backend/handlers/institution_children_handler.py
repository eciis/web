"""Institution Children handler."""

from google.appengine.ext import ndb

from utils import Utils
from util import login_required, Notification, NotificationsQueueManager
from utils import json_response
from custom_exceptions import NotAuthorizedException
from custom_exceptions import EntityException
from send_email_hierarchy import RequestLinkEmailSender

from models import Institution

from service_entities import enqueue_task
from util import get_subject

from . import BaseHandler

__all__ = ['InstitutionChildrenHandler']

def create_notification(user, receiver_institution, sender_institution, create_message):
    """
    Create new notification and add in Queue.

    Keyword arguments:
    user -- Use to receive notification.
    receiver_institution -- Institution key in which the notification is directed.
    sender_institution --Institution in which the user took action.
    create_message -- Message of notification.
    """
    message = create_message(
        user_key=user.key, 
        current_institution_key=user.current_institution, 
        receiver_institution_key=receiver_institution.key, 
        sender_institution_key=sender_institution.key)

    notification = Notification(
        message=message,
        entity_key=receiver_institution.key.urlsafe(),
        notification_type='REMOVE_INSTITUTION_LINK',
        receiver_key=receiver_institution.admin.urlsafe()
    )

    notification_id = NotificationsQueueManager.create_notification_task(notification)
    return notification_id


class InstitutionChildrenHandler(BaseHandler):
    """Institution Children Handler."""

    @json_response
    @login_required
    @ndb.transactional(xg=True)
    def delete(self, user, institution_children_urlsafe, institution_parent_urlsafe):
        """
        Handle delete parent link between institutions.

        This handler remove the parent link between two institutions.
        This handler is called by children institution to remove link with the parent.
        """
        institution_children = ndb.Key(urlsafe=institution_children_urlsafe).get() 
        institution_parent = ndb.Key(urlsafe=institution_parent_urlsafe).get()

        Utils._assert(not type(institution_children) is Institution,
                      "Key is not an institution", EntityException)
        Utils._assert(not type(institution_parent) is Institution,
                      "Key is not an institution", EntityException)

        user.check_permission('remove_link',
                              "User is not allowed to remove link between institutions",
                              institution_children_urlsafe)

        # Remove Parent
        institution_children.set_parent(None)
        admin = institution_parent.admin
        
        notification_id = create_notification(
            user=user,
            receiver_institution=institution_parent,
            sender_institution=institution_children,
            create_message=institution_children.create_notification_message
        )

        enqueue_task('remove-admin-permissions', {
            'institution_key': institution_children.key.urlsafe(), 
            'parent_key': institution_parent.key.urlsafe(),
            'notification_id': notification_id
        })

        email_sender = RequestLinkEmailSender(**{
            'institution_parent_name': institution_parent.name,
            'institution_parent_email': institution_parent.institutional_email,
            'institution_requested_key': institution_parent.key.urlsafe(),
            'institution_child_name': institution_children.name,
            'institution_child_email': institution_children.institutional_email,
            'subject': get_subject('REMOVED_LINK_EMAIL'),
            'receiver': admin.get().email[0],
            'html': 'removed_institutional_link.html'
        })
        email_sender.send_email()
