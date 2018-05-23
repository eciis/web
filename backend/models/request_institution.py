# -*- coding: utf-8 -*-
"""Request institution Model."""

from . import Invite
from . import Request
from google.appengine.ext import ndb
from custom_exceptions.fieldException import FieldException
from send_email_hierarchy.request_institution_email_sender import RequestInstitutionEmailSender
from util.strings_pt_br import get_subject
from . import get_deciis
from custom_exceptions import FieldException
from send_email_hierarchy import AcceptedInstitutionEmailSender


__all__ = ['RequestInstitution']

class RequestInstitution(Request):
    """Request Institution Model."""

    def isValid(self):
        sender = self.sender_key
        if not sender:
            raise FieldException("The request require sender_key")

    @staticmethod
    def create(data):
        """Create a post and check required fields."""
        request = RequestInstitution()
        request.sender_key = ndb.Key(urlsafe=data.get('sender_key'))
        request = Invite.create(data, request)
        request.institution_requested_key = get_deciis().key
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
        email_sender = RequestInstitutionEmailSender(**{
            'receiver': self.sender_key.get().email[0],
            'subject': subject,
            'institution_key': institution.key.urlsafe(),
            'html': html,
            'user_name': self.sender_name,
            'user_email': self.sender_key.get().email[0],
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

    def send_notification(self, current_institution):
        """Method of send notification of request intitution."""
        notification_type = 'REQUEST_INSTITUTION'

        """
            The super user is the admin of 
            'Departamento do Complexo Industrial e Inovação em Saúde".
        """
        super_user = get_deciis().admin.get()
        notification_message = self.create_notification_message(user_key=self.sender_key, 
        receiver_institution_key=self.institution_requested_key)
        super(RequestInstitution, self).send_notification(
            current_institution=current_institution, 
            receiver_key=super_user.key,
            notification_type=notification_type,
            message=notification_message
        )

    def make(self):
        """Create json of request to institution."""
        request_inst_json = super(RequestInstitution, self).make()
        request_inst_json['type_of_invite'] = 'REQUEST_INSTITUTION'
        request_inst_json['institution_name'] = self.institution_key.get().name
        return request_inst_json
