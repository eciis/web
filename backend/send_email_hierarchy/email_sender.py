"""Email sender model."""
import sys
import json
from google.appengine.api import taskqueue
from utils import Utils
reload(sys)
sys.setdefaultencoding('utf8')


class EmailSender(object):

    def __init__(self, **kwargs):
        self.subject = kwargs['subject']
        self.receiver = kwargs['receiver']
        self.html = 'default.html'
        self.body = kwargs['body'] if 'body' in kwargs.keys() else ""

    def send_email(self, email_json=None):
        taskqueue.add(
            url='/api/queue/send-email',
            target='worker',
            queue_name='notifications',
            params={
                'invitee': self.receiver,
                'subject': self.subject,
                'html': self.html,
                'json': json.dumps(email_json if email_json else {'body': self.body})
            }
        )
