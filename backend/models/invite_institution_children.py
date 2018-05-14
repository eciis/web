"""Invite institution children model."""
from . import InviteInstitution

__all__ = ['InviteInstitutionChildren']

class InviteInstitutionChildren(InviteInstitution):
    """Model of invite institution children."""

    @staticmethod
    def create(data):
        """Create a post and check required fields."""
        invite = InviteInstitutionChildren()
        invite = InviteInstitution.create(data, invite)

        return invite

    def create_conection_institution(self, institution):
        """Method of creating connection between invitation and institution children."""
        institution.create_children_connection(self)

    def make(self):
        """Create json of invite to children institution."""
        invite_children_json = super(InviteInstitutionChildren, self).make()
        invite_children_json['type_of_invite'] = 'INSTITUTION_CHILDREN'
        return invite_children_json

    def send_response_notification(self, current_institution, invitee_key, action):
        """Define the notification type of notification when the invite is accepted or rejected."""
        notification_type = 'ACCEPT_INVITE_HIERARCHY' if action == 'ACCEPT' else 'REJECT_INSTITUTION_LINK'
        notification_message = self.create_notification_message(invitee_key, 
            current_institution_key=current_institution, sender_institution_key=self.stub_institution_key, 
            receiver_institution_key=self.institution_key)
    
        self.send_response(current_institution, invitee_key, notification_type, message=notification_message)
