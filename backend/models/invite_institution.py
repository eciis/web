"""Invite institution model."""
from invite import Invite
from models.institution import Institution
from custom_exceptions.fieldException import FieldException
from models.user import User
from send_email_hierarchy.invite_institution_email_sender import InviteInstitutionEmailSender


class InviteInstitution(Invite):
    """Model of invite institution."""

    @staticmethod
    def check_is_invite_institution_valid(data):
        """Check if invite for institution is valid."""
        if data.get('suggestion_institution_name') is None:
            raise FieldException(
                "The invite for institution have to specify the suggestion institution name")

    @staticmethod
    def create(data, invite=None):
        """
        Create an invite and check required fields.

        Receive the data of invite.
        can receive a pre-created invitation of type parent or children,
        if not receive creates an invitation of type Institution.
        """
        if not invite:
            invite = InviteInstitution()

        invite = Invite.create(data, invite)
        invite.invitee = data.get('invitee')

        InviteInstitution.check_is_invite_institution_valid(data)
        invite.suggestion_institution_name = data[
            'suggestion_institution_name']
        institution = Institution.create_inst_stub(invite)

        invite.create_conection_institution(institution)
        invite.stub_institution_key = institution.key

        return invite

    def create_conection_institution(self, institution):
        """Method of creating connection between invitation and institution."""
        pass

    def send_email(self, host, body=None):
        """Method of send email of invite institution."""
        subject = "Convite plataforma CIS"
        email_sender = InviteInstitutionEmailSender(**{
            'receiver': self.invitee,
            'subject': subject,
            'institution': self.institution_key.get().name,
            'inviter': self.sender_name,
            'invited_institution': self.suggestion_institution_name
        })
        email_sender.send_email()

    def send_notification(self, user):
        """Method of send notification of invite institution."""
        entity_type = 'INVITE'

        user_found = User.get_active_user(self.invitee)

        if user_found:
            super(InviteInstitution, self).send_notification(user, user_found.key.urlsafe(), entity_type)

    def send_response_notification(self, user, receiver_key, operation):
        """Send notification to sender of invite when invite is accepted or rejected."""
        response_type = 'ACCEPT_INVITE_INSTITUTION' if operation == 'ACCEPT' else 'REJECT_INVITE_INSTITUTION'
        super(InviteInstitution, self).send_notification(user, receiver_key, response_type)

    def make(self):
        """Create json of invite to institution."""
        invite_inst_json = super(InviteInstitution, self).make()
        invite_inst_json['invitee'] = self.invitee
        invite_inst_json['suggestion_institution_name'] = self.suggestion_institution_name
        invite_inst_json['stub_institution'] = Institution.make(self.stub_institution_key.get(),
                                                                ['name', 'key', 'state'])
        invite_inst_json['type_of_invite'] = 'INSTITUTION'
        return invite_inst_json
