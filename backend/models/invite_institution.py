"""Invite institution model."""
from . import Invite
from . import Institution
from custom_exceptions import FieldException
from . import User
from send_email_hierarchy import InviteInstitutionEmailSender
from util import get_subject
from util import Notification
from util import NotificationsQueueManager
from service_messages import create_system_message

__all__ = ['InviteInstitution']

class InviteInstitution(Invite):
    """Model of invite institution."""

    @staticmethod
    def check_is_invite_institution_valid(data):
        """Check if invite for institution is valid."""
        if data.get('suggestion_institution_name') is None:
            raise FieldException(
                "The invite for institution have to specify the suggestion institution name")

    @staticmethod
    def create(data, invite=None):
        """
        Create an invite and check required fields.

        Receive the data of invite.
        can receive a pre-created invitation of type parent or children,
        if not receive creates an invitation of type Institution.
        """
        if not invite:
            invite = InviteInstitution()

        invite = Invite.create(data, invite)
        invite.invitee = data.get('invitee')

        InviteInstitution.check_is_invite_institution_valid(data)
        invite.suggestion_institution_name = data[
            'suggestion_institution_name']
        institution = Institution.create_inst_stub(invite)

        invite.create_conection_institution(institution)
        invite.stub_institution_key = institution.key

        return invite

    def create_conection_institution(self, institution):
        """Method of creating connection between invitation and institution."""
        pass

    def send_email(self, host, body=None):
        """Method of send email of invite institution."""
        subject = get_subject('INVITE')
        email_sender = InviteInstitutionEmailSender(**{
            'receiver': self.invitee,
            'subject': subject,
            'invite_key': self.key.urlsafe(),
            'institution': self.institution_key.get().name,
            'inviter': self.sender_name,
            'invited_institution': self.suggestion_institution_name
        })
        email_sender.send_email()

    def send_reject_response_notification(self, current_institution, invitee_key):
        """Define the entity type of notification when the invite is accepted or rejected."""
        notification_type = 'REJECT_INVITE_INSTITUTION'
        self.send_response(current_institution, invitee_key, notification_type)

    def send_response(self, current_institution, invitee_key, notification_type, message=None):
        """Send notification to sender of invite when invite is accepted or rejected."""
        self.send_notification(
            current_institution=current_institution, 
            sender_key=invitee_key, 
            receiver_key=self.sender_key or self.admin_key,
            notification_type=notification_type,
            message=message
        )
 
    def create_accept_response_notification(self, notification_type, institution_key, receiver_key_urlsafe, user=None):
        """Create the accept notification and insert it into the pull queue.
        
        Params:
        receiver_key_urlsafe -- the urlsafe of notification's receiver's key
        user -- the user who accepted the invite. Can be None in system's notification.
        institution_key -- the key of the institution created by the user
        """
        message = self.get_notification_message(institution_key, user)

        notification = Notification(
            entity_key=self.key.urlsafe(),
            receiver_key=receiver_key_urlsafe,
            notification_type=notification_type,
            message=message
        )

        return NotificationsQueueManager.create_notification_task(
            notification)
    
    def get_notification_message(self, institution_key, user=None):
        """Returns the correct notification's message by choosing between system_messages
        or regular messages.
        
        Params:
        institution_key -- the key of the institution that the user has created.
        user -- the user who is sending notification, if it is not none.
        If it is None, it means that the notification is a system's notification which
        doesn't have any user.
        """
        return self.create_notification_message(
                    user.key,
                    institution_key,
                    user.current_institution,
                    self.institution_requested_key
                ) if user else create_system_message(institution_key)

    def make(self):
        """Create json of invite to institution."""
        invite_inst_json = super(InviteInstitution, self).make()
        invite_inst_json['invitee'] = self.invitee
        invite_inst_json['suggestion_institution_name'] = self.suggestion_institution_name
        invite_inst_json['stub_institution'] = Institution.make(self.stub_institution_key.get(),
                                                                ['name', 'key', 'state'])
        invite_inst_json['type_of_invite'] = 'INSTITUTION'
        return invite_inst_json
