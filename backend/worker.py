"""Send notifications handler."""
import webapp2
import json
import permissions
from firebase import send_notification
from google.appengine.api import mail
import logging
from google.appengine.ext import ndb
from models.institution import Institution
from models.post import Post
from models.invite_user import InviteUser
from utils import json_response
from utils import get_all_hierarchy_admin_permissions
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
        receiver_key = self.request.get("receiver_key")
        message = json.loads(self.request.get("message"))
        entity_type = self.request.get("entity_type")
        entity = json.loads(self.request.get("entity"))

        send_notification(
            receiver_key,
            message,
            entity_type,
            entity
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
        mail.send_mail(sender="Plataforma Virtual CIS <plataformavirtualcis@gmail.com>",
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
        post_author_key = self.request.get('receiver_key')
        sender_key = self.request.get('sender_key')
        post_key = self.request.get('entity_key')
        entity_type = self.request.get('entity_type')
        current_institution = ndb.Key(urlsafe=self.request.get('current_institution'))
        
        subscribers = ndb.Key(urlsafe=post_key).get().subscribers

        user_is_author = post_author_key == sender_key
        for subscriber in subscribers:
            subscriber_is_sender = subscriber.urlsafe() == sender_key
            if not (user_is_author and subscriber_is_sender) and not subscriber_is_sender:
                send_message_notification(
                    subscriber.urlsafe(),
                    sender_key,
                    entity_type,
                    post_key,
                    current_institution
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

        env = Environment(loader=FileSystemLoader('templates'))
        template = env.get_template(self.request.get('html'))
        
        for member_key in institution.members:
            member = member_key.get()
            is_admin = member_key == institution.admin
            if(is_admin and justification):
                message['body'] += """pelo seguinte motivo:
                '%s'
                """ % justification
            
            mail.send_mail(sender="Plataforma Virtual CIS <plataformavirtualcis@gmail.com>",
                        to="<%s>" % member.email,
                        subject=subject,
                        body="",
                        html=template.render(json.loads(message)))


class NotifyFollowersHandler(BaseHandler):
    """Handle requests to notify institution followers."""

    def post(self):
        """Send notifications to institution followers."""
        sender_key = self.request.get('sender_key')
        entity_type = self.request.get('entity_type')
        inst_key = self.request.get('institution_key')
        current_institution = ndb.Key(urlsafe=self.request.get('current_institution'))
        
        institution = ndb.Key(urlsafe=inst_key).get()

        for follower_key in institution.followers:
            follower = follower_key.get()
            is_active = follower.state == "active"
            if is_active:
                send_message_notification(
                    follower.key.urlsafe(),
                    sender_key,
                    entity_type,
                    inst_key,
                    current_institution
                )


class AddAdminPermissionsInInstitutionHierarchy(BaseHandler):

    def addAdminPermissions(self, institution_key):
        institution = ndb.Key(urlsafe=institution_key).get()
        admin = institution.admin.get()

        if institution.parent_institution:
            parent_institution = institution.parent_institution.get()
            admin_parent = parent_institution.admin.get()
            
            for permission in admin.permissions:
                for institution_key in admin.permissions[permission]:
                    admin_parent.add_permission(permission, institution_key)

            self.addAdminPermissions(parent_institution.key.urlsafe())

    def post(self):
        institution_key = self.request.get('institution_key')
        self.addAdminPermissions(institution_key)


class RemoveAdminPermissionsInInstitutionHierarchy(BaseHandler):

    def removeAdminPermissions(self, institution_key, permissions):
        institution = ndb.Key(urlsafe=institution_key).get()
        admin = institution.admin.get()
        permissions_keys = permissions.keys()

        for permission in permissions_keys:
            institution_keys = permissions[permission].keys()
            for institution_key in institution_keys:
                if ndb.Key(urlsafe=institution_key) not in admin.institutions:
                    admin.remove_permission(permission, institution_key)

        if institution.parent_institution:
            self.removeAdminPermissions(institution.parent_institution.urlsafe(), permissions)

    def post(self):
        institution_key = self.request.get('institution_key')
        institution = ndb.Key(urlsafe=institution_key).get()
        admin = institution.admin.get()
        
        if institution.parent_institution:
            permissions = admin.permissions
            self.removeAdminPermissions(institution_key, permissions)

class AddPostInInstitution(BaseHandler):
    
    def post(self):
        institution_key = self.request.get('institution_key')
        institution = ndb.Key(urlsafe=institution_key).get()
        created_post_key = self.request.get('created_post_key')
        created_post = ndb.Key(urlsafe=created_post_key).get()

        institution.add_post(created_post)

class SendInviteHandler(BaseHandler):

    def post(self):
        """It iterates in an array of invites creating and sending them."""
        keys = json.loads(self.request.get('invites_keys'))
        host = self.request.get('host')
        current_institution = self.request.get('current_institution')
        current_institution = ndb.Key(urlsafe=current_institution)
        for key in keys:
            invite = ndb.Key(urlsafe=key).get()
            invite.send_invite(host, current_institution)


class TransferPermissionsHandler(BaseHandler):

    def add_permission(self, user, permissions):
        for permission in permissions:
            if permission in user.permissions:
                user.permissions[permission].update(permissions[permission])
            else:
                user.permissions.update({permission: permissions[permission]})
    
    def remove_permissions(self, user, permissions):
        for permission in permissions:
            if permission in user.permissions:
                for institution_key in permissions[permission]:
                    user.remove_permission(permission, institution_key)
    
    def post(self):
        institution_key = self.request.get('institution_key')
        user_key = self.request.get('user_key')
        permissions = get_all_hierarchy_admin_permissions(institution_key)
        institution = ndb.Key(urlsafe=institution_key)
        admin = institution.admin.get()
        new_admin = ndb.Key(urlsafe=user_key).get()

        self.add_permission(new_admin, permissions)
        self.remove_permissions(admin, permissions)

        institution.admin = new_admin
        new_admin.institutions_admin.append(institution.key)
        admin.institutions_admin.remove(institution.key)

        institution.put()
        admin.put()
        new_admin.put()


app = webapp2.WSGIApplication([
    ('/api/queue/send-notification', SendNotificationHandler),
    ('/api/queue/send-email', SendEmailHandler),
    ('/api/queue/remove-inst', RemoveInstitutionHandler),
    ('/api/queue/post-notification', PostNotificationHandler),
    ('/api/queue/email-members', EmailMembersHandler),
    ('/api/queue/notify-followers', NotifyFollowersHandler),
    ('/api/queue/add-admin-permissions', AddAdminPermissionsInInstitutionHierarchy),
    ('/api/queue/remove-admin-permissions', RemoveAdminPermissionsInInstitutionHierarchy),
    ('/api/queue/add-post-institution', AddPostInInstitution),
    ('/api/queue/send-invite', SendInviteHandler),
    ('/api/queue/transfer-permissions', TransferPermissionsHandler)
], debug=True)
