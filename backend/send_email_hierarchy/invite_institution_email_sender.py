"""Invite institution email sender model."""

from email_sender import EmailSender


class InviteInstitutionEmailSender(EmailSender):

    def __init__(self, **kwargs):
        super(InviteInstitutionEmailSender, self).__init__(**kwargs)
        self.html = 'invite_institution_email.html'
        self.inviter = kwargs['inviter']
        self.institution = kwargs['institution']
        self.invited_institution = kwargs['invited_institution']

    def send_email(self):
        email_json = {
            'institution': self.institution,
            'inviter': self.inviter,
            'invited_institution': self.invited_institution
        }
        super(InviteInstitutionEmailSender, self).send_email(email_json)
