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

def create_system_notification(receiver_institution_key, receiver_key, notification_type):
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
    def delete(self, user, institution_key, institution_link):
        """
        Handle delete parent link between institutions.

        This handler remove the parent link between two institutions. 
        If the parameter isParent is true, it means that the removal 
        request has been made from a child institution, otherwise 
        the request has been made by a parent institution.
        """

        user.check_permission('remove_link',
                              "User is not allowed to remove link between institutions",
                              institution_key)

        # holds the reference of the child intitution.
        institution = ndb.Key(urlsafe=institution_key).get() 
        # holds the reference of the parent intitution.
        institution_link = ndb.Key(urlsafe=institution_link).get()

        Utils._assert(not type(institution) is Institution,
                      "Key is not an institution", EntityException)
        Utils._assert(not type(institution_link) is Institution,
                      "Key is not an institution", EntityException)

        is_parent = False
        institution.remove_link(institution_link, is_parent)
        admin = institution_link.admin

        notification_type = 'REMOVE_INSTITUTION_LINK'
        notification_id = create_system_notification(
            institution_link.key,
            user.key.urlsafe(),
            notification_type
        )

        enqueue_task('remove-admin-permissions', {
            'institution_key': institution_link.key.urlsafe(), 
            'parent_key': institution.key.urlsafe(),
            'notification_id': notification_id
        })

        email_sender = RequestLinkEmailSender(**{
            'institution_parent_name': institution.name,
            'institution_parent_email': institution.institutional_email,
            'institution_requested_key': institution_link.key.urlsafe(),
            'institution_child_name': institution_link.name,
            'institution_child_email': institution_link.institutional_email,
            'subject': get_subject('REMOVED_LINK_EMAIL'),
            'receiver': admin.get().email[0],
            'html': 'removed_institutional_link.html'
        })
        email_sender.send_email()

        notification_message = institution.create_notification_message(user_key=user.key, current_institution_key=user.current_institution, 
            receiver_institution_key=institution_link.key, sender_institution_key=institution.key)
        send_message_notification(
            receiver_key=admin.urlsafe(),
            notification_type=notification_type,
            entity_key=institution_link.key.urlsafe(),
            message=notification_message
        )