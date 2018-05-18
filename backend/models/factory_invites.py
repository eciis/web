"""Factory of invites."""
from . import InviteUser
from . import InviteUserAdm
from . import InviteInstitution
from . import InviteInstitutionParent
from . import InviteInstitutionChildren
from . import RequestInstitutionParent
from . import RequestInstitutionChildren
from . import RequestInstitution
from . import RequestUser


class InviteFactory:
    """Class of create invites."""

    # Constants of invite types
    INVITE_TYPE = {
        'USER': InviteUser,
        'USER_ADM': InviteUserAdm,
        'INSTITUTION_PARENT': InviteInstitutionParent,
        'INSTITUTION_CHILDREN': InviteInstitutionChildren,
        'INSTITUTION': InviteInstitution,
        'REQUEST_USER': RequestUser,
        'REQUEST_INSTITUTION_PARENT': RequestInstitutionParent,
        'REQUEST_INSTITUTION_CHILDREN': RequestInstitutionChildren,
        'REQUEST_INSTITUTION': RequestInstitution
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
