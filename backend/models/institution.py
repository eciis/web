"""Institution Model."""

from google.appengine.ext import ndb

from search_module.search_institution import SearchInstitution
from models import Address
from permissions import DEFAULT_ADMIN_PERMISSIONS
from permissions import DEFAULT_SUPER_USER_PERMISSIONS
from service_messages import create_message

__all__ = ['Institution']

class Institution(ndb.Model):
    """Model of Institution."""

    name = ndb.StringProperty(required=True)

    acronym = ndb.StringProperty()

    cnpj = ndb.StringProperty()

    legal_nature = ndb.StringProperty(
        choices=set(["PUBLIC", "PRIVATE_FOR-PROFIT", "PRIVATE_NON-PROFIT", "STARTUP"]))

    address = ndb.StructuredProperty(Address)

    actuation_area = ndb.StringProperty()

    description = ndb.TextProperty()

    photo_url = ndb.StringProperty()

    portfolio_url = ndb.StringProperty(indexed=False)

    # Email of the admin
    email = ndb.StringProperty()

    # Institutional email
    institutional_email = ndb.StringProperty()

    website_url = ndb.StringProperty(indexed=False)

    phone_number = ndb.StringProperty()

    branch_line = ndb.StringProperty()

    # Bollean that represents if the institution is Trusted or not.
    trusted = ndb.BooleanProperty(default=False)

    # Name of the leader
    leader = ndb.StringProperty()

    # The admin user of this institution
    admin = ndb.KeyProperty(kind="User")

    # The parent institution
    # Value is None for institutions without parent
    # User query to retrieve children institutions
    parent_institution = ndb.KeyProperty(kind="Institution")

    # The children institutions
    # Value is None for institutions without children
    children_institutions = ndb.KeyProperty(kind="Institution", repeated=True)

    # Key of invite to create institution
    invite = ndb.KeyProperty(kind="Invite")

    # The ids of users who are members of this institution
    members = ndb.KeyProperty(kind="User", repeated=True)

    # Users subscribed to this institution's posts
    # All these followers receive copies of the posts
    # of this institution in their timeline.
    followers = ndb.KeyProperty(kind="User", repeated=True)

    # Posts created by members of this institution
    posts = ndb.KeyProperty(kind="Post", repeated=True)

    # TODO: First version don't have timeline. Do After
    # @author: Mayza Nunes 22/05/2017
    # timeline = ndb.KeyProperty(kind="Timeline")

    state = ndb.StringProperty(choices=set([
        'pending',
        'active',
        'inactive'
    ]), default='pending')

    cover_photo = ndb.StringProperty()

    def follow(self, user_key):
        """Add one user in collection of followers."""
        if user_key not in self.followers:
            self.followers.append(user_key)
            self.put()

    def unfollow(self, user_key):
        """Remove one user in collection of followers."""
        if user_key in self.followers and user_key not in self.members:
            self.followers.remove(user_key)
            self.put()

    def add_member(self, member):
        """Add a new member to the institution."""
        if member.key not in self.members:
            self.members.append(member.key)
            self.put()

    def remove_member(self, member):
        """Remove a member from institution."""
        if member.key in self.members:
            if self.key in member.institutions_admin:
                raise Exception("Admin can not be removed")
            member.remove_institution(self.key)
            self.members.remove(member.key)
            self.put()

    def add_post(self, post):
        """Add a new post to the institution list of posts."""
        self.posts.append(post.key)
        self.put()

    def addInvite(self, invite):
        """Add invite in institution."""
        self.invite = invite.key
        self.put()

    def add_child(self, child_key):
        """Add a new child to children_institutions."""
        if child_key not in self.children_institutions:
            self.children_institutions.append(child_key)
            self.put()

    def set_parent(self, parent_key):
        """Set a new parent."""
        self.parent_institution = parent_key
        self.put()

    @ndb.transactional(xg=True)
    def create_parent_connection(self, invite):
        """Make connections between parent and daughter institution."""
        self.add_child(invite.institution_key)

        institution_children = invite.institution_key.get()
        institution_children.parent_institution = self.key
        institution_children.put()

    @ndb.transactional(xg=True)
    def create_children_connection(self, invite):
        """Make connections between daughter and parent institution."""
        self.parent_institution = invite.institution_key
        self.put()

        parent_institution = invite.institution_key.get()
        parent_institution.add_child(self.key)

    @staticmethod
    @ndb.transactional(xg=True)
    def create_inst_stub(invite):
        """Create a stub of institution."""
        institution_stub = Institution()
        institution_stub.name = invite.suggestion_institution_name
        institution_stub.email = invite.invitee
        institution_stub.state = 'pending'
        institution_stub.address = Address()
        institution_stub.photo_url = "app/images/institution.png"

        institution_stub.put()

        return institution_stub

    @ndb.transactional(xg=True)
    def createInstitutionWithStub(self, user, institution):
        institution.follow(user.key)
        institution.add_member(user)
        institution.set_admin(user.key)
        institution.change_state('active')
        if (institution.photo_url is None):
            institution.photo_url = "app/images/institution.png"
            institution.put()

        user.add_institution(institution.key)
        user.add_institution_admin(institution.key)
        user.change_state("active")
        user.follow(institution.key)

        return institution

    @ndb.transactional(xg=True)
    def remove_institution(self, remove_hierarchy, user):
        """Remove an institution.

        Params:
        remove_hierarchy -- string the represents if the institution's hiearchy
        will be removed
        user -- the admin of the institution.
        """
        has_permission = user.has_permission('remove_inst', self.key.urlsafe(
        )) or user.has_permission('remove_insts', self.key.urlsafe())

        if(has_permission):
            self.state = "inactive"
            user.remove_institution(self.key)
            self.put()
    
    @ndb.transactional(xg=True)
    def handle_hierarchy_removal(self, remove_hierarchy, user):
        """This method allows this procedure to be done in a queue.
        It handles the hierarchy removal once it is called by every child
        institution.
        There are three possibilities of flow. The first one happens when
        remove_hierarchy is true and what it does is to call a method that will
        iterate over the children and can remove the current child. Later, this method
        is called from there to handle the child's hierarchy removal. The second and
        the third one happen when remove_hierarchy is false. The second happens when
        self has a parent_institution. Inside of this condition, a returned_method is
        set to remove_parent_connection. In the third possibility of flow, the returned_method
        is set to set_parent_for_none. With this approach the queue can act in the hierarchy
        like it hasn't been touched yet, when remove_hierarchy is false, and once the queue
        has done what it should have done it calls the returned_method to finish the removal
        process.

        Params:
        remove_hierarchy -- works as a flag that indicates the institution's hierarchy removal
        user -- the user who started the institution's removal process. So, it may not be the admin
        of self.
        """
        returned_method = None
        # Remove the hierarchy
        if remove_hierarchy == "true":
            self.remove_institution_hierarchy(remove_hierarchy, user)
        # Change the parent's and children's pointers
        elif self.parent_institution:
            returned_method = self.remove_parent_connection
        # Change the children's pointers if there is no parent
        else:
            returned_method = self.set_parent_for_none
        return returned_method

    def remove_link(self, institution_link, is_parent):
        """Remove the connection between self and institution_link."""
        if is_parent == "true":
            self.parent_institution = None
        else:
            self.children_institutions.remove(institution_link.key)
        self.put()

    def remove_institution_hierarchy(self, remove_hierarchy, user):
        """Remove institution's hierarchy."""
        for child in self.children_institutions:
            child = child.get()
            if self.verify_connection(child):
                child.remove_institution(remove_hierarchy, user)
                child.handle_hierarchy_removal(remove_hierarchy, user)

    def remove_parent_connection(self):
        """Change parent connection when remove an institution."""
        parent = self.parent_institution.get()
        parent.children_institutions.remove(self.key)
        for child in self.children_institutions:
            parent.children_institutions.append(child)
            child = child.get()
            child.parent_institution = parent.key
            child.put()
        parent.put()

    def set_parent_for_none(self):
        """Set parent of the children institutions for none when remove an institution."""
        for child in self.children_institutions:
            child = child.get()
            child.parent_institution = None
            child.put()
    
    def set_admin(self, user_key):
        if self.has_member(user_key):
            self.admin = user_key
            self.email = user_key.get().email[0]
            self.put()

    @ndb.transactional(xg=True)
    def remove_institution_from_users(self, remove_hierarchy):
        """Remove institution from members/followers list when an institution is deleted.

        This method allows this procedure to be done in a queue.
        """
        if self.state == 'inactive':
            for member in self.members:
                member = member.get()
                member.remove_institution(self.key)
            if remove_hierarchy == "true":
                for child in self.children_institutions:
                    child = child.get()
                    child.remove_institution_from_users(remove_hierarchy)

    def change_state(self, state):
        """Change the institution state."""
        self.state = state
        self.put()

    def make(self, attributes):
        """Create an institution dictionary with specific filds."""
        institution = {}
        for attribute in attributes:
            attr_value = getattr(self, attribute)
            if(isinstance(attr_value, ndb.Key)):
                attr_value = attr_value.urlsafe()
            if((attribute == "invite") and attr_value):
                invite_key = self.key.get().invite
                attr_value = {
                    'suggestion_institution_name': invite_key.get().suggestion_institution_name,
                    'key': invite_key.urlsafe()
                }
            if(attribute == 'address' and attr_value):
                attr_value = dict(self.address)

            institution[attribute] = attr_value
        return institution

    def _post_put_hook(self, future):
        """This method is called after each Institution.put()."""
        search_institution = SearchInstitution()
        search_institution.createDocument(future.get_result().get())
    
    def has_member(self, user_key):
        """Check if the user is member."""
        return user_key in self.members

    def is_active(self):
        """Check if is active."""
        return self.state == "active"
    
    def get_hierarchy_admin_permissions(self, get_all=True, admin_key=None, permissions=None):
        """
        This method get all hierarchy admin permissions of
        institution. When result, returns a dict containing
        the admin permissions of all institutions belonging 
        to the child hierarchy.

        Params:
        get_all (Optional)-- If true, get all permissions from institutions 
        admin_key (Optional) -- admin that requested to unlink the institutions
        hierarchically above the first child with the same admin
        permissions (Optional) -- Dict of previous permissions added for add more permissons. 
        If not passed, creates new dict of permissions
        """
        if not permissions:
            permissions = {}

        institution_key = self.key.urlsafe()

        for permission in DEFAULT_ADMIN_PERMISSIONS:
            if permission in permissions:
                permissions[permission].update({institution_key: True})
            else:
                permissions.update({permission: {institution_key: True}})

        for child_key in self.children_institutions:
            child = child_key.get()
            adm_is_child_adm = child.admin == admin_key
            get_next_permissions = get_all or not adm_is_child_adm
            #The child permissions should only be added if the link is confirmed.
            link_confirmed = child.verify_connection(self)
            if get_next_permissions and link_confirmed:
                child.get_hierarchy_admin_permissions(get_all, admin_key, permissions)
        
        return permissions

    def get_super_user_admin_permissions(self, permissions=None):
        """
        This method get all super user permissions.
        The type permission is only possible when the institution is super institution.
        Returns a dict containing the super user permissions.

        Params:
        permissions(Optional) -- Dict of previous permissions added for add more permissons. 
        If not passed, creates new dict of permissions
        """

        if not permissions:
            permissions = {}

        if self.trusted:
            institution_key = self.key.urlsafe()
            for permission in DEFAULT_SUPER_USER_PERMISSIONS:
                permissions.update({permission: {institution_key: True}})
            
        return permissions

    def create_notification_message(self, user_key, current_institution_key, 
            receiver_institution_key=None, sender_institution_key=None):
        """ Create message that will be used in notification. 
            user_key -- The user key that made the action.
            current_institution -- The institution that user was in the moment that made the action.
            sender_institution_key -- The institution in which action should be taken,
                when it is not specified it will be the current_institution.
            receiver_institution -- The institution to which the notification is directed. 
        """
        return create_message(
            sender_key= user_key,
            current_institution_key=current_institution_key,
            receiver_institution_key=receiver_institution_key,
            sender_institution_key= sender_institution_key or current_institution_key
        )

    def verify_connection(self, institution_to_verify):
        """This method checks if the link between self and institution_to_verify
        is confirmed."""
        #Means that self is institution_to_verify's parent
        parent_link = institution_to_verify.parent_institution == self.key and institution_to_verify.key in self.children_institutions
        #Means that institution_to_verify is self's parent
        child_link = self.parent_institution == institution_to_verify.key and self.key in institution_to_verify.children_institutions
        return child_link or parent_link


    @staticmethod
    def has_connection_between(possible_child_key, possible_parent_key):
        """
        It makes a bottom-up verification to check if these institutions are connected.

        Params:
        possible_child_key -- key of institution that is belived 
            to be the child, if the connection exists
        possible_parent_key -- key of institution that is belived 
            to be the parent, if the connection exists
        """
        def has_connection(parent_key):
            if not parent_key:
                return False

            connection_found = parent_key == possible_parent_key
            return connection_found or has_connection(parent_key.get().parent_institution)

        return has_connection(possible_child_key.get().parent_institution)
