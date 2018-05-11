"""Factory of invites."""
from models.invite_user import InviteUser
from models.invite_user_adm import InviteUserAdm
from models.invite_institution import InviteInstitution
from models import InviteInstitutionParent
from models import InviteInstitutionChildren
from models.request_institution_parent import RequestInstitutionParent
from models.request_institution_children import RequestInstitutionChildren
from models.request_institution import RequestInstitution
from models.request_user import RequestUser


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
