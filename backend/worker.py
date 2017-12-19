"""Send notifications handler."""
import webapp2
import json
from firebase import send_notification
from google.appengine.api import mail
import logging
from google.appengine.ext import ndb
from utils import json_response
from service_messages import send_message_notification
from service_messages import send_message_email
from jinja2 import Environment, FileSystemLoader


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
        env = Environment(loader=FileSystemLoader('templates'))
        template = env.get_template(self.request.get('html'))
        html_content = json.loads(self.request.get('json'))
        mail.send_mail(sender="e-CIS <eciis@splab.ufcg.edu.br>",
                       to="<%s>" % invitee,
                       subject=subject,
                       body="",
                       html=template.render(html_content))


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
        subscribers = ndb.Key(urlsafe=post_key).get().subscribers

        entity_type = self.request.get('entity_type')
        message = {'type': entity_type, 'from': user_name.encode('utf8')}
        userIsAuthor = post_author_key == current_user_key
        for subscriber in subscribers:
            subscriberIsCurrentUser = subscriber.urlsafe() == current_user_key
            if not (userIsAuthor and subscriberIsCurrentUser) and not subscriberIsCurrentUser:
                send_message_notification(
                    subscriber.urlsafe(),
                    json.dumps(message),
                    entity_type,
                    post_key
                )

class EmailMembersHandler(BaseHandler):
    """Handle requests to send emails to institution members."""

    def post(self):
        """Send emails to institution members."""
        inst_key = self.request.get('institution_key')
        justification = self.request.get('justification')
        message = self.request.get('message')
        subject = self.request.get('subject')

        institution = ndb.Key(urlsafe=inst_key).get()

        for member_key in institution.members:
            member = member_key.get()
            is_admin = member_key == institution.admin
            if(is_admin and justification):
                message = message + """pelo seguinte motivo:
                '%s'
                """ % justification

            send_message_email(
                member.email,
                message,
                subject
            )


class NotifyFollowersHandler(BaseHandler):
    """Handle requests to notify institution followers."""

    def post(self):
        """Send notifications to institution followers."""
        inst_key = self.request.get('institution_key')
        message = self.request.get('message')
        entity_type = self.request.get('entity_type')

        institution = ndb.Key(urlsafe=inst_key).get()

        for follower_key in institution.followers:
            follower = follower_key.get()
            is_active = follower.state == "active"
            if is_active:
                send_message_notification(
                    follower.key.urlsafe(),
                    message,
                    entity_type,
                    institution.key.urlsafe()
                )



app = webapp2.WSGIApplication([
    ('/api/queue/send-notification', SendNotificationHandler),
    ('/api/queue/send-email', SendEmailHandler),
    ('/api/queue/remove-inst', RemoveInstitutionHandler),
    ('/api/queue/post-notification', PostNotificationHandler),
    ('/api/queue/email-members', EmailMembersHandler),
    ('/api/queue/notify-followers', NotifyFollowersHandler)
], debug=True)
