"""Send notifications handler."""
import webapp2
import json
from firebase import send_notification
from google.appengine.api import mail
import logging
from google.appengine.ext import ndb
from models.institution import Institution
from models.post import Post
from utils import json_response
from service_messages import send_message_notification


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

    @json_response
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


class RemoveInstitutionHandler(BaseHandler):
    """Handler that resolves tasks relationated with remove an institution."""

    def post(self):
        """Remove the institution from users's list."""
        # Retrieving the params
        institution = self.request.get('institution_key')
        remove_hierarchy = self.request.get('remove_hierarchy')
        # Retrieving the institution
        institution = ndb.Key(urlsafe=institution).get()

        institution.remove_institution_from_users(remove_hierarchy)


class PostNotificationHandler(BaseHandler):
    """Handler that sends post's notifications to another queue."""

    def post(self):
        """Handle post requests."""
        post_author_key = self.request.get('author_key')
        current_user_key = self.request.get('user_key')
        user_name = self.request.get('user_name')
        post_key = self.request.get('post_key')
        followers = ndb.Key(urlsafe=post_key).get().followers

        entity_type = self.request.get('entity_type')
        message = {'type': entity_type, 'from': user_name.encode('utf8')}
        userIsAuthor = post_author_key == current_user_key
        for follower in followers:
            followerIsCurrentUser = follower.urlsafe() == current_user_key
            if not (userIsAuthor and followerIsCurrentUser) and not followerIsCurrentUser:
                send_message_notification(
                    follower.urlsafe(),
                    json.dumps(message),
                    entity_type,
                    post_key
                )


app = webapp2.WSGIApplication([
    ('/api/queue/send-notification', SendNotificationHandler),
    ('/api/queue/send-email', SendEmailHandler),
    ('/api/queue/remove-inst', RemoveInstitutionHandler),
    ('/api/queue/post-notification', PostNotificationHandler)
], debug=True)
