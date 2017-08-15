"""Send notifications handler."""
import webapp2
import json
from firebase import send_notification
from google.appengine.api import mail


class SendNotificationHandler(webapp2.RequestHandler):
    """Class of send notifications."""

    def post(self):
        """Method of create new task for send notification."""
        user_key = self.request.get("user_key")
        message = json.loads(self.request.get("message"))
        entity_type = self.request.get("entity_type")
        entity_key = self.request.get("entity_key")

        send_notification(
            user_key,
            message,
            entity_type,
            entity_key
        )


class SendEmailHandler(webapp2.RequestHandler):
    """Class of send emails."""

    def post(self):
        """Method of send new email."""
        invitee = self.request.get('invitee')
        subject = self.request.get('subject')
        body = self.request.get('body')

        mail.send_mail(sender="e-CIS <eciis@splab.ufcg.edu.br>",
                       to="<%s>" % invitee,
                       subject=subject,
                       body=body)

app = webapp2.WSGIApplication([
    ('/api/queue/send-notification', SendNotificationHandler),
    ('/api/queue/send-email', SendEmailHandler)
], debug=True)
