# -*- coding: utf-8 -*-
"""Send notifications handler."""
import webapp2
import json
from firebase import send_notification
from google.appengine.api import mail
import logging
from google.appengine.ext import ndb
from models import Institution
from models.post import Post
from models.invite_user import InviteUser
from models.invite_user_adm import InviteUserAdm
from utils import json_response
from util.strings_pt_br import get_subject
from service_messages import send_message_notification
from service_messages import send_message_email
from jinja2 import Environment, FileSystemLoader
from permissions import DEFAULT_SUPER_USER_PERMISSIONS
from permissions import DEFAULT_ADMIN_PERMISSIONS
from send_email_hierarchy.remove_institution_email_sender import RemoveInstitutionEmailSender


def should_remove(user, institution_key, current_inst_key):
    """
    This method checks whether or not a permission should be removed from the user. 
    If the user is an administrator of the institution and this institution is 
    not the one in which the transfer of permissions is being done (Current_inst_key), 
    it returns false because the permission should not be removed, otherwise it returns true.

    Arguments:
    user -- User to verify permission
    institution_key -- Institution key to verify that permissions must be removed
    current_inst_key -- Key of the institution from which the transfer of permissions is being made.
    """
    is_current_inst = institution_key == current_inst_key
    is_not_admin = (not is_current_inst) and ndb.Key(urlsafe=institution_key) not in user.institutions_admin
    
    return is_not_admin or is_current_inst

def filter_permissions_to_remove(user, permissions, institution_key, should_remove):
    """
    This method filters the permissions passed as a parameter and 
    returns a dictionary of filtered permissions that must be removed 
    from the user according to the rules applied in the 'should_remove' method.

    Arguments:
    user -- User to verify if permission must be removed
    permissions -- Permissions to filter
    institution_key -- Key of the institution from which the transfer of permissions is being made.
    """
    permissions_filtered = {}
    for permission, institutions in permissions.items():
            institution_keys = [inst for inst in institutions if should_remove(user, inst, institution_key)]
            permissions_filtered[permission] = institution_keys
    return  permissions_filtered

def is_admin_of_parent_inst(user, institution_parent_key):
    """
    This method checks if the user is an administrator of some parent institution.

    Arguments:
    user -- User to verify if is admin of some parent institution
    institution_parent_key -- Key of parent institution for check if user is admin 
    """
    if ndb.Key(urlsafe=institution_parent_key) in user.institutions_admin:
        return True
    
    parent_inst = ndb.Key(urlsafe=institution_parent_key).get()

    if parent_inst.parent_institution:
        return is_admin_of_parent_inst(user, parent_inst.parent_institution.urlsafe())
    else:
        return False


def is_not_admin(user, institution_key, *args):
    """This function acts as a should_remove function of filter_permissions_to_remove 
    when the worker removes the admin permissions."""
    return not user.is_admin(ndb.Key(urlsafe=institution_key))


def get_all_parent_admins(child_institution, admins=[]):
    """It's a helper function that provides all the admins going up in the hierarchy.
    
    The admins' list starts empty and as passed by reference is the same over the recursion's stack.
    child_institution is used to get the parent and so on go up in the hierarchy.
    """
    admins.append(child_institution.admin.get())
    parent_institution = child_institution.parent_institution
    if parent_institution:
        parent_institution = parent_institution.get()
        link_confirmed = child_institution.verify_connection(parent_institution)
        if link_confirmed:
            get_all_parent_admins(parent_institution, admins)
    return admins


def add_permission_to_children(parent, admins, permission):
    """It goes down in the hierarchy using the parent institution
    and add permission for each of the admin inside of the admins list."""
    for child_key in parent.children_institutions:
        child = child_key.get()
        if(child.verify_connection(parent)):
            for admin in admins:
                admin.add_permission(permission, child_key.urlsafe())
            add_permission_to_children(child, admins, permission)


def remove_permissions(remove_hierarchy, institution):
        """This function has two possibilities of flow depending on the remove_hierarchy's value.
        If it's true, the function removes all the admins' permissions in the hierarchy,
        otherwise it removes only the first institution's admin permissions in the hierarchy."""
        admin = institution.admin.get()
        current_permissions = institution.get_hierarchy_admin_permissions()
        if remove_hierarchy == "true":
            for permission, institutions in current_permissions.items():
                for inst in institutions:
                    admin.remove_permission(permission, inst)

            for child in institution.children_institutions:
                child = child.get()
                if(child.verify_connection(institution)):
                    remove_permissions(remove_hierarchy, child)
        else:
            current_permissions = filter_permissions_to_remove(
                admin, current_permissions, institution.key, is_not_admin)
            for permission, institution_keys in current_permissions.items():
                for institution_key in institution_keys:
                    admin.remove_permission(permission, institution_key)


def notify_institution_removal(institution, remove_hierarchy, user, current_institution_key=None):
    """This method has two possibilities of flow depending on
    the remove_hierarchy's value.
    If it's true, the method send email and notification to all
    the hierarchy. Otherwise it send just to the first institution.
    
    Params:
    institution -- the current institution in the hierarchy whose admin
    will receive an email and a notification.
    remove_hierarchy -- string that works as a flag informing if the hierarchy.
    has been removed or not.
    user -- the user who made the request to remove the institution.
    """
    subject = get_subject('INSTITUION_REMOVAL')
    body = """Lamentamos informar que a instituição %s foi
     removida pelo usuário %s """ % (institution.name, user.name)
    email_params = {
        "body": body,
        "subject": subject,
        "inst_key": institution.key.urlsafe()
    }
    email_sender = RemoveInstitutionEmailSender(**email_params)
    email_sender.send_email()

    user_has_to_receive_notification = institution.admin != user.key

    if user_has_to_receive_notification:
        notification_message = institution.create_notification_message(
            user_key=user.key,
            current_institution_key=current_institution_key,
            sender_institution_key=institution.key

        )
        send_message_notification(
            receiver_key=institution.admin.urlsafe(),
            notification_type='DELETED_INSTITUTION',
            entity_key=institution.key.urlsafe(),
            message=notification_message
        )

    if remove_hierarchy == "true":
        for child_key in institution.children_institutions:
            child = child_key.get()
            if child.state == "inactive":
                notify_institution_removal(child, remove_hierarchy, user, current_institution_key)


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
        notification_type = self.request.get("notification_type")
        entity = json.loads(self.request.get("entity"))

        send_notification(
            receiver_key,
            message,
            notification_type,
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
        """Remove the permissions relationed to the institution and its hierarchy, if remove_hierarchy is true, 
        and remove the institution from users's list.""" 
        institution_key = self.request.get('institution_key')
        remove_hierarchy = self.request.get('remove_hierarchy')
        institution = ndb.Key(urlsafe=institution_key).get()
        current_institution = self.request.get('current_institution') and ndb.Key(urlsafe=self.request.get('current_institution'))
        user = ndb.Key(urlsafe=self.request.get('user_key')).get()

        @ndb.transactional(xg=True, retries=10)
        def apply_remove_operation(remove_hierarchy, institution, user):
            returned_method = institution.handle_hierarchy_removal(remove_hierarchy, user)
            institution.remove_institution_from_users(remove_hierarchy)
            remove_permissions(remove_hierarchy, institution)
            notify_institution_removal(institution, remove_hierarchy, user, current_institution_key=current_institution)
            
            if returned_method:
                returned_method()
        apply_remove_operation(remove_hierarchy, institution, user)


class PostNotificationHandler(BaseHandler):
    """Handler that sends post's notifications to another queue."""

    def post(self):
        """Handle post requests."""
        post_author_key = self.request.get('receiver_key')
        sender_url_key = self.request.get('sender_key')
        post_key = self.request.get('entity_key')
        entity_type = self.request.get('entity_type')
        current_institution_key = ndb.Key(urlsafe=self.request.get('current_institution'))
        sender_inst_key = self.request.get('sender_institution_key') and ndb.Key(urlsafe=self.request.get('sender_institution_key'))
        post = ndb.Key(urlsafe=post_key).get()

        notification_message = post.create_notification_message(
            ndb.Key(urlsafe=sender_url_key),
            current_institution_key,
            sender_inst_key
        )
        subscribers =  [subscriber.urlsafe() for subscriber in post.subscribers]

        user_is_author = post_author_key == sender_url_key
        for subscriber in subscribers:
            subscriber_is_sender = subscriber == sender_url_key
            if not (user_is_author and subscriber_is_sender) and not subscriber_is_sender:
                send_message_notification(
                    receiver_key=subscriber,
                    notification_type=entity_type,
                    entity_key=post_key,
                    message=notification_message
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
        entity_key = self.request.get('entity_key')
        current_institution_key = ndb.Key(urlsafe=self.request.get('current_institution'))
        entity = self.request.get('entity') if self.request.get('entity') else None
        inst_key = self.request.get('institution_key')
        institution = ndb.Key(urlsafe=inst_key).get()
        
        obj = ndb.Key(urlsafe=entity_key).get() if(entity_key) else institution
        notification_message = obj.create_notification_message(ndb.Key(urlsafe=sender_key), current_institution_key)

        for follower_key in institution.followers:
            follower = follower_key.get()
            is_active = follower.state == "active"
            if is_active and follower.key.urlsafe() != sender_key:
                send_message_notification(
                    receiver_key=follower.key.urlsafe(),
                    notification_type=entity_type,
                    entity_key=entity_key or inst_key,
                    message=notification_message,
                    entity=entity
                )


class AddAdminPermissionsInInstitutionHierarchy(BaseHandler):

    def addAdminPermissions(self, institution_key):
        """Add admins' permissions, to the first institution and its children,
        to all admins, going up in the hierarchy."""
        institution = ndb.Key(urlsafe=institution_key).get()
        admins = get_all_parent_admins(institution, [])
            
        for permission in DEFAULT_ADMIN_PERMISSIONS:
            for admin in admins:
                admin.add_permission(permission, institution_key)
            add_permission_to_children(institution, admins, permission)

    def post(self):
        institution_key = self.request.get('institution_key')
        self.addAdminPermissions(institution_key)


class RemoveAdminPermissionsInInstitutionHierarchy(BaseHandler):

    def removeAdminPermissions(self, user, permissions):
        """Iterate over the permissions and remove them for each set of institutions keys."""
        for permission, institution_keys in permissions.items():
            for institution_key in institution_keys:
                user.remove_permission(permission, institution_key)

    def post(self):
        """Get the permissions and provide them to the remove function."""
        institution_key = self.request.get('institution_key')
        institution = ndb.Key(urlsafe=institution_key).get()

        parent_institution_key = self.request.get('parent_key')
        parent_institution = ndb.Key(urlsafe=parent_institution_key).get()

        parent_admin = parent_institution.admin.get()
        child_admin_key = institution.admin

        @ndb.transactional(xg=True, retries=10)
        def apply_remove_operation(parent_admin, institution, should_remove, child_admin_key):
            """This method is responsible for getting the permissions involved
            in the link and go up in the hierarchy removing the permissions from
            the admins that have to lose it, based in a condition that checks if 
            the current_admin is different of the child_admin.  
            """
            parent_admins = get_all_parent_admins(parent_institution, [])
            for current_admin in parent_admins:
                if current_admin.key != child_admin_key:
                    permissions = institution.get_hierarchy_admin_permissions(
                        get_all=False, admin_key=current_admin.key)
                    self.removeAdminPermissions(
                        current_admin, permissions)
        apply_remove_operation(parent_admin, institution, is_not_admin, child_admin_key)

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


class TransferAdminPermissionsHandler(BaseHandler):
    """Handler of transfer admin permissions."""

    def add_permissions(self, user, institution):
        """
        This method adds to user the permissions retrieved from the institution 
        hierarchy, started at the institution passed as parameter.

        Arguments:
        user -- user to add permissions
        institution -- institution from which 
        all hierarchical permissions are going to be get
        """
        permissions = institution.get_hierarchy_admin_permissions()
        permissions = institution.get_super_user_admin_permissions(permissions)
        for permission in permissions:
            if permission in user.permissions:
                user.permissions[permission].update(permissions[permission])
            else:
                user.permissions.update({permission: permissions[permission]})
    
    def remove_permissions(self, user, institution):
        """    
        This method removes from user the permissions retrieved from the institution 
        hierarchy, started at the institution passed as parameter.
        
        Arguments:
        user -- User to remove permissions
        institution -- institution from which
        all hierarchical permissions are going to be get
        """
        permissions = institution.get_hierarchy_admin_permissions(get_all=False, admin_key=user.key)
        permissions = institution.get_super_user_admin_permissions(permissions)
        permissions_filtered = filter_permissions_to_remove(user, permissions, institution.key, should_remove)
        
        for permission, institution_keys in permissions_filtered.items():
            for instition_key in institution_keys:
                user.remove_permission(permission, instition_key)


    def post(self):
        """
        This method is responsible for adding all administrator permissions linked 
        to an institution to the new administrator, and removing the same permissions 
        from the old administrator. It performs a search for all permissions for the 
        institution in which the administrator transfer is being made and its hierarchy of children, 
        finally inserts these permissions in the new administrator and removes from the old administrator.
        """
        institution_key = self.request.get('institution_key')
        user_key = self.request.get('user_key')
        institution = ndb.Key(urlsafe=institution_key).get()
        admin = institution.admin.get()
        new_admin = ndb.Key(urlsafe=user_key).get()
        
        @ndb.transactional(xg=True, retries=10)
        def save_changes(admin, new_admin, institution):
            institution.set_admin(new_admin.key)
            self.add_permissions(new_admin, institution)
            
            if (not institution.parent_institution) or (not is_admin_of_parent_inst(admin, institution.parent_institution.urlsafe())):
                self.remove_permissions(admin, institution)
            
            if(institution.trusted):
                for permission in DEFAULT_SUPER_USER_PERMISSIONS:
                    admin.remove_permission(permission, institution.key.urlsafe())

            new_admin.put()
            admin.put()
            institution.put()
        
        save_changes(admin, new_admin, institution)


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
    ('/api/queue/transfer-admin-permissions', TransferAdminPermissionsHandler)
], debug=True)
