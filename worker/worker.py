"""Send notifications handler."""
import webapp2
import json
from firebase import send_notification
from google.appengine.api import mail
import logging


class BaseHandler(webapp2.RequestHandler):
    """Base Handler."""

    def handle_exception(self, exception, debug):
        """Handle exception."""
        logging.exception(str(exception))
        self.response.set_status(500)
        self.response.headers[
            'Content-Type'] = 'application/json; charset=utf-8'
        self.response.write(json.dumps({
            "msg": "Error! %s" % str(exception)
        }))


class SendNotificationHandler(BaseHandler):
    """
    Handler of send notifications.

    This handler resolves the tasks of sending notifications by firebase.
    """

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


class SendEmailHandler(BaseHandler):
    """
    Handler of send emails.

    This handler resolves the tasks of sending email.
    """

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
