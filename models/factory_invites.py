"""Factory of invites."""
from models.invite_user import InviteUser
from models.invite_institution import InviteInstitution
from models.invite_institution_parent import InviteInstitutionParent
from models.invite_institution_children import InviteInstitutionChildren


class InviteFactory:
    """Class os create invites."""

    INVITE_TYPE = {
        'USER': InviteUser,
        'INSTITUTION_PARENT': InviteInstitutionParent,
        'INSTITUTION_CHILDREN': InviteInstitutionChildren,
        'INSTITUTION': InviteInstitution
    }

    @staticmethod
    def create(data, invite_type):
        """Method of create invites."""
        type_class = InviteFactory.INVITE_TYPE.get(invite_type)
        invite = type_class.create(data)
        return invite
