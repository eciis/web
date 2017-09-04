"""Factory of invites."""
from models.invite_user import InviteUser
from models.invite_institution import InviteInstitution
from models.invite_institution_parent import InviteInstitutionParent
from models.invite_institution_children import InviteInstitutionChildren
from models.request_user import RequestUser


class InviteFactory:
    """Class of create invites."""

    # Constants of invite types
    INVITE_TYPE = {
        'USER': InviteUser,
        'INSTITUTION_PARENT': InviteInstitutionParent,
        'INSTITUTION_CHILDREN': InviteInstitutionChildren,
        'INSTITUTION': InviteInstitution,
        'REQUEST_USER': RequestUser
    }

    @staticmethod
    def create(data, invite_type):
        """
        Method of create invites.

        Receive the data and type of invite.
        Return new instance of invite case exists type received.
        """
        type_class = InviteFactory.INVITE_TYPE.get(invite_type)
        invite = type_class.create(data)
        return invite
