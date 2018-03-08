"""Invite User Admin Model."""
from google.appengine.ext import ndb
from invite_user import InviteUser
from utils import Utils
from custom_exceptions.notAuthorizedException import NotAuthorizedException


class InviteUserAdm(InviteUser):
    """Model of Invite User Admin."""

    def check_invite(self):
        invitee = self.invitee_key
        institution = self.institution_key.get()
        Utils._assert(
            invitee not in institution.members, 
            "The invitee is not a member of this institution!", 
            NotAuthorizedException)
        

    @staticmethod
    def create(data):
        invite = InviteUserAdm()
        invite.invitee_key = ndb.Key(urlsafe=data['invitee_key'])
        InviteUser.create(data, invite)
        invite.check_invite()
        return invite
        

    def send_notification(self, current_institution, entity_type=None, sender_key=None, receiver_key=None):
        if not entity_type:
         entity_type = 'USER_ADM'
         
        super(InviteUserAdm, self).send_notification(
            current_institution=current_institution, 
            sender_key=sender_key, 
            receiver_key=receiver_key,
            entity_type=entity_type
        )
    
    def send_response_notification(self, current_institution, action):
        """Send notification to sender of invite when invite is accepted or rejected."""
        entity_type = "ACCEPT_INVITE_USER_ADM" if action == 'ACCEPT' else "REJECT_INVITE_USER_ADM"
        self.send_notification(
            current_institution=current_institution, 
            sender_key=self.invitee_key, 
            receiver_key=self.sender_key or self.admin_key,
            entity_type=entity_type
        )
    
    def send_email(self, host):
        pass

    def make(self):
        make = super(InviteUserAdm, self).make()
        make['type_of_invite'] = 'INVITE_USER_ADM'
        make['invitee_key'] = self.invitee_key.urlsafe()
        return make