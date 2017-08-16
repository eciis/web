"""Invite institution model."""
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

    def send_email(self, host, body=None):
        """Method of send email of invite institution."""
        institution_key = self.institution_key.urlsafe()
        invite_key = self.key.urlsafe()
        body = body or """
        Sua empresa %s foi convidada a se cadastrar na plataforma.
        Para realizar o cadastro crie sua conta pessoal em
        http://%s/app/#/institution/%s/%s/new_invite/INSTITUTION
        e proceda com o cadastro da sua empresa.
        Equipe e-CIS
        """ % (self.suggestion_institution_name, host, institution_key, invite_key)

        super(InviteInstitution, self).send_email(host, body)

    def send_notification(self, user):
        """Method of send notification of invite institution."""
        entity_type = 'INSTITUTION'
        super(InviteInstitution, self).send_notification(user, entity_type)

    def make(self):
        """Create json of invite to institution."""
        invite_inst_json = super(InviteInstitution, self).make()
        invite_inst_json['suggestion_institution_name'] = self.suggestion_institution_name
        invite_inst_json['stub_institution_key'] = self.stub_institution_key.urlsafe()
        invite_inst_json['type_of_invite'] = 'INSTITUTION'
        return invite_inst_json
