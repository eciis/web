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

    def createConectionInstitution(self, institution):
        """Method of creating connection between invitation and institution children."""
        Institution.create_children_connection(institution, self)

    def make(self):
        """Create json of invite to children institution."""
        invite_children_json = super(InviteInstitutionChildren, self).make()
        invite_children_json['type_of_invite'] = 'INSTITUTION_CHILDREN'
        return invite_children_json
