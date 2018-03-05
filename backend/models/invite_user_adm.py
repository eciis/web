"""Invite User Admin Model."""
from invite_user import InviteUser


class InviteUserAdm(InviteUser):
    """Model of Invite User Admin."""

    @staticmethod
    def create(data):
        invite = InviteUserAdm()
        InviteUser.create(data, invite)
        return invite
        

    def send_notification(self, current_institution):
        entity_type = 'USER_ADM' 
        super(InviteUserAdm, self).send_notification(current_institution, entity_type=entity_type)
    
    def send_email(self, host):
        pass

    def make(self):
        make = super(InviteUserAdm, self).make()
        make['type_of_invite'] = 'INVITE_USER_ADM'
        return make