# -*- coding: utf-8 -*-
"""Invite Model."""
from google.appengine.ext import ndb
from google.appengine.ext.ndb.polymodel import PolyModel
from service_messages import send_message_notification
from service_messages import create_message
from send_email_hierarchy import EmailSender
from . import User       
from util import get_subject      


__all__ = ['Invite']

class Invite(PolyModel):
    """Model of Invite."""

    # Email of the invitee.
    invitee = ndb.StringProperty()

    # Key of user admin
    # In the invitations, he sends the invitation.
    # In requests, he receives the request.
    admin_key = ndb.KeyProperty(kind="User", required=True)

    # Key of user sender
    # This property is used in requests
    sender_key = ndb.KeyProperty(kind="User")

    # Status of Invite.
    status = ndb.StringProperty(choices=set([
        'sent',
        'accepted',
        'rejected']), default='sent')

    # Name of the institution invited, if the type of invite is institution.
    suggestion_institution_name = ndb.StringProperty()

    """ Key of the institution who inviter is associate."""
    institution_key = ndb.KeyProperty(kind="Institution")

    """ Key of the institution requested. Is used only in requests for institutions"""
    institution_requested_key = ndb.KeyProperty(kind="Institution")

    # Key of stub institution to wich the invite was send.
    # Value is None for invite the User
    stub_institution_key = ndb.KeyProperty(kind="Institution")

    #  Indicates whether the operation is of the requested type
    is_request = ndb.BooleanProperty(default=False)

    # Invitee key for the invite user admin
    invitee_key = ndb.KeyProperty(kind="User")

    # Data to create InstitutionProfile for user requests
    sender_name = ndb.StringProperty()
    office = ndb.StringProperty()
    institutional_email = ndb.StringProperty()

    @staticmethod
    def create(data, invite):
        """Create an invite and check required fields."""
        invite.admin_key = ndb.Key(urlsafe=data.get('admin_key'))
        invite.is_request = data.get('is_request') or False
        invite.institution_key = ndb.Key(urlsafe=data.get('institution_key'))
        invite.sender_key = invite.admin_key
        if data.get('sender_key'):
            invite.sender_key = ndb.Key(urlsafe=data.get('sender_key'))
        invite.sender_name = invite.sender_key.get().name
        if data.get('sender_name'):
            invite.sender_name = data.get('sender_name')

        return invite

    def send_invite(self, host, current_institution=None):
        """Send invite."""
        self.send_notification(current_institution)
        self.send_email(host)

    def send_email(self, host, receiver_email=None, body=None):
        """Method of send email of invite user."""
        subject = get_subject('INVITE')
        receiver_email = receiver_email or self.invitee
        body = body or """Você recebeu um convite da plataforma CIS. """
        email_sender = EmailSender(**{
            'receiver': receiver_email, 
            'subject': subject, 
            'body': body
        })
        email_sender.send_email()

    def create_notification_message(self, user_key, current_institution_key=None, 
            sender_institution_key=None, receiver_institution_key=None):
        """ Create message that will be used in notification. 
            user_key -- The user key that made the action.
            current_institution_key -- The institution that user was in the moment that made the action,
                 in case that user is inactive he didn't have current institution.
            sender_institution_key -- The institution in which action should be taken.
            receiver_institution -- The institution to which the notification is directed. 
        """
        return create_message(
            sender_key=user_key,
            current_institution_key=current_institution_key,
            sender_institution_key=sender_institution_key or self.institution_key,
            receiver_institution_key=receiver_institution_key or self.institution_requested_key,
        )

    def send_notification(self, current_institution, sender_key=None, receiver_key=None, notification_type=None, entity_key=None, message=None):
        """Method of send notification to invitee."""
        sender_key = sender_key or self.sender_key
        if not receiver_key:
            active_invitee = User.get_active_user(self.invitee)
            receiver_key = active_invitee and active_invitee.key
        if receiver_key:
            notification_type = notification_type or 'INVITE'
            entity_key = entity_key or self.key.urlsafe()
            notification_message = message or self.create_notification_message(sender_key, current_institution)
            send_message_notification(
                receiver_key=receiver_key.urlsafe(),
                notification_type=notification_type,
                entity_key=entity_key,
                message=notification_message
            )

    def make(self):
        """Create personalized json of invite."""
        REQUIRED_PROPERTIES = ['name', 'address', 'description',
                               'key', 'photo_url', 'institutional_email',
                               'phone_number', 'email', 'trusted']
        institution_admin = self.institution_key.get()
        institution_admin = institution_admin.make(['name'])
        institution = self.institution_key.get()
        institution = institution.make(REQUIRED_PROPERTIES)
        return {
            'admin_name': self.admin_key.get().name,
            'sender_name': self.sender_name,
            'key': self.key.urlsafe(),
            'status': self.status,
            'institution_admin': institution_admin,
            'institution': institution
        }

    def change_status(self, status):
        """Change the invite state."""
        self.status = status
        self.put()
