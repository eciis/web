# -*- coding: utf-8 -*-
"""Request institution Model."""

from . import Request
from google.appengine.ext import ndb
from send_email_hierarchy import RequestInstitutionEmailSender
from util import get_subject
from . import get_deciis
from custom_exceptions import FieldException


__all__ = ['RequestInstitution']

class RequestInstitution(Request):
    """Request Institution Model."""

    @staticmethod
    def isLinked(institution_key, institution_requested):
        institution = institution_key.get()
        
        is_parent_from_top_down_perspective = institution_requested.key in institution.children_institutions
        is_parent_from_bottom_up_perspective = institution_key == institution_requested.parent_institution
        is_parent = is_parent_from_top_down_perspective and is_parent_from_bottom_up_perspective

        is_child_from_bottom_up_perspective = institution.parent_institution == institution_requested.key
        is_child_from_top_down_perspective = institution_key in institution_requested.children_institutions
        is_child = is_child_from_bottom_up_perspective and is_child_from_top_down_perspective

        return is_parent or is_child

    @staticmethod
    def isRequested(sender_inst_key, institution_requested_key):
        request = RequestInstitution.query(
            RequestInstitution.institution_requested_key == institution_requested_key,
            RequestInstitution.institution_key == sender_inst_key,
            RequestInstitution.status == 'sent')

        return request.count() > 0

    def isValid(self):
        institution_key = self.institution_key
        sender = self.sender_key
        institution_requested = self.institution_requested_key.get()
        if not sender:
            raise FieldException("The request require sender_key")
        if not institution_requested:
            raise FieldException("The request require institution_requested")
        if RequestInstitution.isLinked(institution_key, institution_requested):
            raise FieldException("The institutions has already been connected.")
        if RequestInstitution.isRequested(institution_key, institution_requested.key):
            raise FieldException("The requested institution has already been invited")

    @staticmethod
    def create(data, request=None):
        """Create a post and check required fields."""
        if not request:
            request = RequestInstitution()
            request.institution_requested_key = get_deciis().key

        request.sender_key = ndb.Key(urlsafe=data.get('sender_key'))
        request = Request.create(data, request)
        request.isValid()
        return request

    def send_response_email(self, operation, host=None):
        """Method to send email of sender institution when invite is accepted or rejected."""
        if operation == "ACCEPT":
            subject = get_subject('ACCEPTED_REQUEST_INSTITUTION')
            html = 'accepted_institution_request_email.html'
            
        else:
            subject = get_subject('REJECTED_REQUEST_INSTITUTION')
            html = 'rejected_institution_request_email.html'

        institution = self.institution_key.get()
        institution_requested = self.institution_requested_key.urlsafe()
        user = self.sender_key.get()
        email_sender = RequestInstitutionEmailSender(**{
            'receiver': user.email[0],
            'subject': subject,
            'institution_key': institution.key.urlsafe(),
            'html': html,
            'user_name': user.name,
            'user_email': user.email[0],
            'description': institution.description,
            'institution_name': institution.name,
            'institution_requested_key': institution_requested
        })
        email_sender.send_email()

    def send_email(self, host, body=None):
        """Method of send email of request institution link."""
        subject = get_subject('REQUEST_INSTITUTION')
        admin = get_deciis().admin.get()
        institution = self.institution_key.get()
        institution_requested = self.institution_requested_key.urlsafe()
        email_sender = RequestInstitutionEmailSender(**{
            'html': 'request_institution_email.html',
            'receiver': admin.email[0],
            'subject': subject,
            'user_name': self.sender_name,
            'user_email': self.sender_key.get().email[0],
            'description': institution.description,
            'institution_name': institution.name,
            'institution_key': self.institution_key.urlsafe(),
            'institution_requested_key': institution_requested
        })
        email_sender.send_email()

    def send_notification(self, current_institution, receiver_key=None, notification_type=None, message=None):
        """Method of send notification of request intitution."""
        notification_type = notification_type or 'REQUEST_INSTITUTION'

        """
            The super user is the admin of 
            'Departamento do Complexo Industrial e Inovação em Saúde".
        """
        if not receiver_key:
            super_user = get_deciis().admin.get()
        
        notification_message = message or self.create_notification_message(user_key=self.sender_key, 
        receiver_institution_key=self.institution_requested_key)
        super(RequestInstitution, self).send_notification(
            current_institution=current_institution, 
            receiver_key=receiver_key or super_user.key,
            notification_type=notification_type,
            message=notification_message
        )

    def make(self):
        """Create json of request to institution."""
        request_inst_json = super(RequestInstitution, self).make()
        request_inst_json['type_of_invite'] = 'REQUEST_INSTITUTION'
        request_inst_json['institution_name'] = self.institution_key.get().name
        return request_inst_json
