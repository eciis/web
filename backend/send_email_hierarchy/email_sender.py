"""Email sender model."""
import sys
import json
from google.appengine.api import taskqueue
from utils import Utils
reload(sys)
sys.setdefaultencoding('utf8')

MAXIMUM_SIZE = 29
LAST_CHAR = 26

class EmailSender(object):

    def __init__(self, **kwargs):
        """The class constructor.

        It initializes the object with the common properties.
        """
        self.subject = kwargs['subject']
        self.receiver = kwargs['receiver']
        self.html = 'default.html'
        self.body = kwargs['body'] if 'body' in kwargs.keys() else ""

    def send_email(self, email_json=None):
        """Enqueue a sending email task.

        Args:
        email_json: This property is sent to the html file to fill the email's data
        if it is None, the entity's body property become the content.
        """
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

    def crop_institution_name(self, institution_name):
        """Crop the institution name if it is bigger than the maximum size."""
        institution_name = (institution_name[:LAST_CHAR] + '...') if len(institution_name) > MAXIMUM_SIZE else institution_name
        return institution_name