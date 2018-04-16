"""Invite institution parent model."""
from invite_institution import InviteInstitution
from models.institution import Institution


class InviteInstitutionParent(InviteInstitution):
    """Model of invite institution parent."""

    @staticmethod
    def create(data):
        """Create a post and check required fields."""
        invite = InviteInstitutionParent()
        invite = InviteInstitution.create(data, invite)

        return invite

    def create_conection_institution(self, institution):
        """Method of creating connection between invitation and institution parent."""
        Institution.create_parent_connection(institution, self)

    def make(self):
        """Create json of invite to parent institution."""
        invite_parent_json = super(InviteInstitutionParent, self).make()
        invite_parent_json['type_of_invite'] = 'INSTITUTION_PARENT'
        return invite_parent_json

    def send_response_notification(self, current_institution, invitee_key, action):
        """Define the entity type of notification when the invite is accepted or rejected."""
        entity_type = 'ACCEPT_INVITE_HIERARCHY' if action == 'ACCEPT' else 'REJECT_INSTITUTION_LINK'
        self.send_response(current_institution, invitee_key, entity_type)
