"""Invite institution model."""
from google.appengine.api import mail
from invite import Invite
from models.institution import Institution
from custom_exceptions.fieldException import FieldException


class InviteInstitution(Invite):
    """Model of invite institution."""

    @staticmethod
    def checkIsInviteInstitutionValid(data):
        """Check if invite for institution is valid."""
        if data.get('suggestion_institution_name') is None:
            raise FieldException(
                "The invite for institution have to specify the suggestion institution name")

    @staticmethod
    def create(data):
        """Create a post and check required fields."""
        invite = Invite.create(data)

        if (invite.type_of_invite != 'user'):
            InviteInstitution.checkIsInviteInstitutionValid(data)
            invite.suggestion_institution_name = data['suggestion_institution_name']
            institution = Institution.create_inst_stub(invite)
            invite.stub_institution_key = institution.key
        else:
            Invite.checkIsInviteUserValid(data)

        return invite

    @staticmethod
    def sendInvite(invite):
        """Send invite."""
        InviteInstitution.sendInviteInstitution(invite)

    @staticmethod
    def sendInviteInstitution(invite):
        """Send Invite for user create some Institution."""
        mail.send_mail(sender="e-CIS <eciis@splab.ufcg.edu.br>",
                       to="<%s>" % invite.invitee,
                       subject="Convite plataforma e-CIS",
                       body="""
        Sua empresa %s foi convidada a se cadastrar na plataforma.
        Para realizar o cadastro crie sua conta pessoal em
        http://eciis-splab.appspot.com  e proceda com o cadastro da sua empresa.

        Equipe e-CIS
        """ % invite.suggestion_institution_name)

    @staticmethod
    def make(invite):
        """Create personalized json of invite."""
        return invite.make_invite_institution()

    def make_invite_institution(self):
        """Create json of invite to parent institution."""
        return {
            'invitee': self.invitee,
            'inviter': self.inviter,
            'type_of_invite': self.type_of_invite,
            'suggestion_institution_name': self.suggestion_institution_name,
            'stub_institution_key': self.stub_institution_key.urlsafe(),
            'key': self.key.urlsafe(),
            'status': self.status
        }
