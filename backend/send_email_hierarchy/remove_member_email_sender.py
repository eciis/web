"""Remove member email sender model."""

from email_sender import EmailSender


class RemoveMemberEmailSender(EmailSender):

    def __init__(self, **kwargs):
        super(RemoveMemberEmailSender, self).__init__(**kwargs)
        self.body = kwargs['body']
