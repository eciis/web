"""Invite institution children model."""
from invite_institution import InviteInstitution
from models.institution import Institution


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
        Institution.create_children_connection(institution, self)

    def make(self):
        """Create json of invite to children institution."""
        invite_children_json = super(InviteInstitutionChildren, self).make()
        invite_children_json['type_of_invite'] = 'INSTITUTION_CHILDREN'
        return invite_children_json

    def send_response_notification(self, current_institution, invitee_key, action):
        """Define the entity type of notification when the invite is accepted or rejected."""
        entity_type = 'ACCEPT_INVITE_HIERARCHY' if action == 'ACCEPT' else 'REJECT_INSTITUTION_LINK'
        notification_message = self.create_notification_message(invitee_key, 
            current_institution_key=current_institution, sender_institution_key=self.receiver_institution_key, 
            receiver_institution_key=self.institution_key)
    
        self.send_response(current_institution, invitee_key, entity_type, message=notification_message)
