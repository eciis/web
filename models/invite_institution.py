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
    def create(data, invite=None):
        """
        Create a post and check required fields.

        Receive the data of invite.
        can receive a pre-created invitation of type parent or children,
        if not receive creates an invitation of type Institution.
        """
        if not invite:
            invite = InviteInstitution()

        invite = Invite.create(data, invite)

        InviteInstitution.checkIsInviteInstitutionValid(data)
        invite.suggestion_institution_name = data['suggestion_institution_name']
        institution = Institution.create_inst_stub(invite)

        invite.createConectionInstitution(institution)
        invite.stub_institution_key = institution.key

        return invite

    def createConectionInstitution(self, institution):
        """Method of creating connection between invitation and institution."""
        pass

    def sendInvite(self, host):
        """Send Invite for user create some Institution."""
        institution_key = self.institution_key.urlsafe()
        invite_key = self.key.urlsafe()

        mail.send_mail(sender="e-CIS <eciis@splab.ufcg.edu.br>",
                       to="<%s>" % self.invitee,
                       subject="Convite plataforma e-CIS",
                       body="""
        Sua empresa %s foi convidada a se cadastrar na plataforma.
        Para realizar o cadastro crie sua conta pessoal em
        http://%s/app/#/institution/%s/%s/new_invite/INSTITUTION
        e proceda com o cadastro da sua empresa.

        Equipe e-CIS
        """ % (self.suggestion_institution_name, host, institution_key, invite_key))

    def make(self):
        """Create json of invite to institution."""
        invite_inst_json = super(InviteInstitution, self).make()
        invite_inst_json['suggestion_institution_name'] = self.suggestion_institution_name
        invite_inst_json['stub_institution_key'] = self.stub_institution_key.urlsafe()
        invite_inst_json['type_of_invite'] = 'INSTITUTION'
        return invite_inst_json