"""Invite user email sender model."""

from email_sender import EmailSender

class InviteUserEmailSender(EmailSender):

    def __init__(self, **kwargs):
        super(InviteUserEmailSender, self).__init__(**kwargs)
        self.html = 'invite_user.html'
        self.inviter = kwargs['inviter']
        self.institution = kwargs['institution']

    def send_email(self):
        email_json = {
            'institution': self.institution, 
            'inviter': self.inviter, 
        }
        super(InviteUserEmailSender, self).send_email(email_json)
