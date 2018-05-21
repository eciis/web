"""Leave institution email sender model."""

from . import EmailSender


class LeaveInstitutionEmailSender(EmailSender):

    def __init__(self, **kwargs):
        super(LeaveInstitutionEmailSender, self).__init__(**kwargs)
        self.body = kwargs['body']
