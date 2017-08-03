"""Invite institution parent model."""
from invite_institution import InviteInstitution
from models.institution import Institution


class InviteInstitutionChildren(InviteInstitution):
    """Model of invite institution parent."""

    @staticmethod
    def create(data):
        """Create a post and check required fields."""
        invite = InviteInstitutionChildren()
        invite = InviteInstitution.create(data, invite)

        return invite

    def createConectionInstitution(self, institution):
        """Method of creating connection between invitation and institution."""
        Institution.create_children_connection(institution, self)

    def make(self):
        """Create json of invite to parent institution."""
        make = super(InviteInstitutionChildren, self).make()
        make['type_of_invite'] = 'INSTITUTION_CHILDREN'
        return make
