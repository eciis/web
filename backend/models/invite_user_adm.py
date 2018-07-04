"""Invite User Admin Model."""
from google.appengine.ext import ndb
from invite_user import InviteUser
from utils import Utils
from custom_exceptions import NotAuthorizedException
from send_email_hierarchy import TransferAdminEmailSender
from util import get_subject
from util import Notification, NotificationsQueueManager
from service_messages import create_system_message

__all__ = ['InviteUserAdm']

class InviteUserAdm(InviteUser):
    """Model of Invite User Admin."""


    def check_invite(self):
        invitee = self.invitee_key
        institution = self.institution_key.get()
        Utils._assert(
            invitee not in institution.members, 
            "The invitee is not a member of this institution!", 
            NotAuthorizedException)
        
        Utils._assert(
            invitee == institution.admin,
            "The invitee is already admin of this institution!", 
            NotAuthorizedException
        )
        
        Utils._assert(
            self.sender_key != institution.admin, 
            "Sender is not admin of this institution!", 
            NotAuthorizedException
        )
        
        queryAnotherInvite = InviteUserAdm.query(
            InviteUserAdm.institution_key == self.institution_key,
            InviteUserAdm.status == 'sent'
        )

        Utils._assert(
           queryAnotherInvite.count() > 0,
           "An invitation is already being processed for this institution!",
           NotAuthorizedException
        )
        

    @staticmethod
    def create(data):
        invite = InviteUserAdm()
        invite.invitee_key = ndb.Key(urlsafe=data['invitee_key'])
        InviteUser.create(data, invite)
        invite.check_invite()
        return invite
        

    def send_notification(self, current_institution):
        notification_type = 'USER_ADM'
         
        super(InviteUserAdm, self).send_notification(
            current_institution=current_institution, 
            sender_key=self.sender_key, 
            receiver_key=self.invitee_key,
            notification_type=notification_type
        )
    
    def create_system_notification(self):
        """
        Create a new system notification for the new administrator 
        to inform you that administrative permissions have been transferred.
        """
        message = create_system_message(self.institution_key)

        notification = Notification(
            message=message,
            entity_key=self.institution_key.urlsafe(),
            notification_type="TRANSFER_ADM_PERMISSIONS",
            receiver_key=self.invitee_key.urlsafe()
        )

        notification_id = NotificationsQueueManager.create_notification_task(notification)
        return notification_id
    
    def create_accept_response_notification(self, current_institution):
        """
        Create a new accept response notification.
        
        Keyword arguments:
        current_institution -- Current institution of user.
        """
        admin = self.institution_key.get().admin
        message = self.create_notification_message(
            user_key=self.invitee_key,
            current_institution_key=current_institution,
            receiver_institution_key=self.institution_key
        )

        notification = Notification(
            message=message,
            entity_key=self.key.urlsafe(),
            notification_type="ACCEPT_INVITE_USER_ADM",
            receiver_key=admin.urlsafe()
        )

        notification_id = NotificationsQueueManager.create_notification_task(notification)
        return notification_id
    
    def send_reject_response_notification(self, current_institution):
        """Send notification to sender of invite when invite is rejected."""
        notification_type = "REJECT_INVITE_USER_ADM"
        notification_message= self.create_notification_message(
            user_key=self.invitee_key,
            current_institution_key=current_institution,
            receiver_institution_key=self.institution_key
        )
        super(InviteUserAdm, self).send_notification(
            current_institution=current_institution, 
            sender_key=self.invitee_key, 
            receiver_key=self.sender_key or self.admin_key,
            notification_type=notification_type,
            message=notification_message
        )
    
    def send_email(self, host):
        institution = self.institution_key.get()
        subject = get_subject('TRANSFER_ADM_EMAIL')
        email_sender = TransferAdminEmailSender(**{
            'receiver': self.invitee,
            'subject': subject,
            'institution_name': institution.name,
            'institution_email': institution.institutional_email,
            'adm_name': self.sender_name
        })
        email_sender.send_email()

    def make(self):
        make = super(InviteUserAdm, self).make()
        make['type_of_invite'] = 'INVITE_USER_ADM'
        make['invitee_key'] = self.invitee_key.urlsafe()
        make['invitee_name'] = self.invitee_key.get().name
        return make
