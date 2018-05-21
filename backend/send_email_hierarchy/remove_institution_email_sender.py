"""Remove institution email sender model."""

from . import EmailSender
import json
from google.appengine.api import taskqueue

__all__ = ['RemoveInstitutionEmailSender']

class RemoveInstitutionEmailSender(EmailSender):

    def __init__(self, **kwargs):
        super(RemoveInstitutionEmailSender, self).__init__(**kwargs)
        self.institution_key = kwargs['inst_key']
        self.justification = kwargs['justification'] if 'justification' in kwargs.keys() else ""

    def send_email(self):
        """Enqueue a sending email-members task."""
        taskqueue.add(
            url='/api/queue/email-members',
            target='worker',
            queue_name='notifications',
            params={
                'institution_key': self.institution_key,
                'subject': self.subject,
                'html': self.html,
                'justification': self.justification,
                'message': json.dumps({'body': self.body})
            }
        )
