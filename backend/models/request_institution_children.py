# -*- coding: utf-8 -*-
"""Request institution link model."""

from . import Invite
from . import Request
from google.appengine.ext import ndb
from send_email_hierarchy import RequestLinkEmailSender
from util import get_subject
from util import Notification
from util import NotificationsQueueManager

__all__ = ['RequestInstitutionChildren']


def get_html(operation):
    accept_html = 'accept_institution_link_email.html'
    reject_html = 'reject_institutional_link.html'
    return accept_html if operation == 'ACCEPT' else reject_html

def get_subject_type(operation):
    accept_type = 'LINK_CONFIRM'
    reject_type = 'REJECT_LINK_EMAIL'
    return accept_type if operation == 'ACCEPT' else reject_type

class RequestInstitutionChildren(Request):
    """Model of request children institution."""

    @staticmethod
    def create(data):
        """Create a post and check required fields."""
        request = RequestInstitutionChildren()
        request.sender_key = ndb.Key(urlsafe=data.get('sender_key'))
        request.institution_requested_key = ndb.Key(urlsafe=data.get('institution_requested_key'))
        request = Invite.create(data, request)
        request.isValid()
        return request

    def send_email(self, host):
        """Method of send email of request institution link."""
        parent_institution = self.institution_key.get()
        child_institution = self.institution_requested_key.get()

        subject = get_subject('REQUEST_LINK')
        email_sender = RequestLinkEmailSender(**{
            'receiver': child_institution.admin.get().email[0],
            'subject': subject,
            'institution_parent_name': parent_institution.name,
            'institution_parent_email': parent_institution.institutional_email,
            'institution_child_name': child_institution.name,
            'institution_child_email': child_institution.institutional_email,
            'institution_requested_key': child_institution.key.urlsafe()
        })

        email_sender.send_email()

    def send_response_email(self, operation):
        parent_institution = self.institution_key.get()
        child_institution = self.institution_requested_key.get()
        html = get_html(operation)
        subject_type = get_subject_type(operation)
        subject = get_subject(subject_type)

        email_sender = RequestLinkEmailSender(**{
            'receiver': parent_institution.admin.get().email[0],
            'subject': subject,
            'institution_parent_name': parent_institution.name,
            'institution_parent_email': parent_institution.institutional_email,
            'institution_child_name': child_institution.name,
            'institution_child_email': child_institution.institutional_email,
            'institution_requested_key': child_institution.key.urlsafe(),
            'html': html
        })
        email_sender.send_email()

    def send_notification(self, current_institution):
        """Method of send notification of request institution children."""
        notification_type = 'REQUEST_INSTITUTION_CHILDREN'
        admin = self.institution_requested_key.get().admin
        notification_message = self.create_notification_message(
            user_key=self.sender_key, 
            current_institution_key=current_institution,
            sender_institution_key=self.institution_key,
            receiver_institution_key=self.institution_requested_key
        )

        super(RequestInstitutionChildren, self).send_notification(
            current_institution=current_institution, 
            receiver_key=admin, 
            notification_type=notification_type,
            message=notification_message
        )
    
    def create_accept_response_notification(self, current_institution, invitee_key):
        """Create accept notification to sender of invite"""
        notification_message = self.create_notification_message(
            user_key=invitee_key, 
            current_institution_key=current_institution,
            receiver_institution_key=self.institution_key, 
            sender_institution_key=self.institution_requested_key
        )

        notification = Notification(
            entity_key=self.key.urlsafe(), 
            receiver_key=self.sender_key.urlsafe() if self.sender_key else self.admin_key.urlsafe(), 
            notification_type='ACCEPT_INSTITUTION_LINK',
            message=notification_message
        )

        notification_id = NotificationsQueueManager.create_notification_task(notification)
        return notification_id

    def send_reject_response_notification(self, current_institution, invitee_key):
        """Send reject notification to sender of invite."""
        notification_message = self.create_notification_message(
            user_key=invitee_key, 
            current_institution_key=current_institution,
            receiver_institution_key=self.institution_key, 
            sender_institution_key=self.institution_requested_key
        )

        super(RequestInstitutionChildren, self).send_notification(
            current_institution=current_institution, 
            sender_key=invitee_key, 
            receiver_key=self.sender_key or self.admin_key,
            notification_type='REJECT_INSTITUTION_LINK',
            message=notification_message
        )

    def make(self):
        """Create json of request to institution children."""
        request_inst_children_json = super(RequestInstitutionChildren, self).make()
        request_inst_children_json['institution_requested_key'] = self.institution_requested_key.urlsafe()
        request_inst_children_json['type_of_invite'] = 'REQUEST_INSTITUTION_CHILDREN'
        return request_inst_children_json
