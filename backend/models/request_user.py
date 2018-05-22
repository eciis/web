# -*- coding: utf-8 -*-
"""Request user model."""
from . import Invite
from google.appengine.ext import ndb
from custom_exceptions import FieldException
from . import Institution
from . import Request
from send_email_hierarchy import RequestUserEmailSender
from util import get_subject


__all__ = ['RequestUser']

class RequestUser(Request):
    """Model of request user."""

    @staticmethod
    def senderIsMember(sender_key, institution):
        user = ndb.Key(urlsafe=sender_key).get()
        if user:
            instmember = Institution.query(Institution.members.IN(
                [user.key]),
                Institution.key == institution.key)
            return instmember.count() > 0
        return False

    @staticmethod
    def senderIsInvited(sender_key, institutionKey):
        sender_key = ndb.Key(urlsafe=sender_key)
        request = RequestUser.query(
            RequestUser.institution_key == institutionKey,
            RequestUser.status == 'sent',
            RequestUser.sender_key == sender_key)

        return request.count() > 0

    def isValid(self):
        institution = self.institution_key.get()
        sender = self.sender_key.urlsafe()
        if not sender:
            raise FieldException("The request require sender_key")
        if RequestUser.senderIsMember(sender, institution):
            raise FieldException("The sender is already a member")
        if RequestUser.senderIsInvited(sender, institution.key):
            raise FieldException("The sender is already invited")

    @staticmethod
    def create(data):
        """Create a request user."""
        request = RequestUser()
        request.sender_key = ndb.Key(urlsafe=data.get('sender_key'))
        request.sender_name = data.get('sender_name')
        request.office = data.get('office')
        request.institutional_email = data.get('institutional_email')
        request.institution_requested_key = ndb.Key(urlsafe=data.get('institution_key'))
        request = Invite.create(data, request)
        request.isValid()
        return request

    def send_email(self, host, body=None):
        """Method of send email of invite user."""
        subject = get_subject('REQUEST_USER')
        institution_requested = self.institution_requested_key.get()
        admin = self.admin_key.get()
        email_sender = RequestUserEmailSender(**{
            'receiver': admin.email[0],
            'subject': subject,
            'user_name': self.sender_name,
            'user_email': self.sender_key.get().email[0],
            'request_key': self.key.urlsafe(),
            'office': self.office,
            'institution_requested_name': institution_requested.name,
            'institution_requested_admin': admin.name,
            'institution_requested_email': institution_requested.email,
            'institution_requested_key': institution_requested.key.urlsafe()
        })
        email_sender.send_email()

    def send_response_email(self, host, operation):
        """Method to send email of sender user when invite is accepted or rejected."""
        html = 'accepted_request_user_email.html' if operation == 'ACCEPT' else 'rejected_request_user_email.html'
        subject = get_subject('RESPONSE_REQUEST_USER')
        institution_requested = self.institution_requested_key.get()
        email_sender = RequestUserEmailSender(**{
            'receiver': self.sender_key.get().email[0],
            'subject': subject,
            'user_name': self.sender_name,
            'user_email': self.sender_key.get().email[0],
            'request_key': self.key.urlsafe(),
            'office': self.office,
            'institution_requested_name': institution_requested.name,
            'institution_requested_admin': self.admin_key.get().name,
            'institution_requested_email': institution_requested.email,
            'institution_requested_key': institution_requested.key.urlsafe(),
            'html': html
        })
        email_sender.send_email()

    """ 
    The sender, in this case, is the user who is asking to be an institution's members.
    The receiver is the institution's admin, who is receive the notification of the request.
    """
    def send_notification(self, current_institution):
        """Method of send notification of invite user."""
        notification_type = 'REQUEST_USER'
        notification_message= self.create_notification_message(user_key=self.sender_key,
            current_institution_key=current_institution, 
            receiver_institution_key=self.institution_requested_key)

        super(RequestUser, self).send_notification(
            current_institution=current_institution,
            receiver_key=self.admin_key,
            notification_type=notification_type,
            entity_key=self.key.urlsafe(),
            message=notification_message
        )

    """ 
    The sender, in this case, is the user who is asking to be an institution's members.
    The user is who answered the request.
    The institution_key to which the sender requested to be member.
    Action can be REJECTED or ACCEPTED.
    """
    def send_response_notification(self, user, current_institution, action):
        """Method sends response notification to sender request."""
        notification_type = 'ACCEPTED_LINK' if action == 'ACCEPT' else 'REJECTED_LINK'
        notification_message= self.create_notification_message(user_key=user.key,
            current_institution_key=current_institution,
            sender_institution_key=self.institution_requested_key)

        super(RequestUser, self).send_notification(
            current_institution=current_institution,
            receiver_key=self.sender_key,
            notification_type=notification_type,
            entity_key=current_institution.urlsafe(),
            message=notification_message
        )

    def make(self):
        """Create json of invite to user."""
        invite_user_json = super(RequestUser, self).make()
        invite_user_json['sender'] = self.sender_key.get().email
        invite_user_json['sender_name'] = self.sender_name
        invite_user_json['sender_key'] = self.sender_key.urlsafe()
        invite_user_json['office'] = self.office
        invite_user_json['institutional_email'] = self.institutional_email
        invite_user_json['institution_key'] = self.institution_key.urlsafe()
        invite_user_json['type_of_invite'] = 'REQUEST_USER'
        invite_user_json['photo_url'] = self.sender_key.get().photo_url
        return invite_user_json
