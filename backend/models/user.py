"""User Model."""
from search_module.search_user import SearchUser
from google.appengine.ext import ndb
from custom_exceptions.fieldException import FieldException
from custom_exceptions.notAuthorizedException import NotAuthorizedException
from util.provider_institutions import get_deciis
from util.provider_institutions import get_health_ministry
import random

__all__ = ['InstitutionProfile', 'User']

def follow_inst(user,inst):
    user.follow(inst.key)
    inst.follow(user.key)

def pick_color():
    colors = [
        'red',
        'pink',
        'purple',
        'deep-purple',
        'indigo',
        'blue',
        'light-blue',
        'cyan',
        'teal',
        'green',
        'light-green',
        'lime',
        'orange',
        'deep-orange',
        'brown',
        'grey',
        'blue-grey'
    ]
    return colors[random.randint(0,16)]


class InstitutionProfile(ndb.Model):
    """Model of InstitutionProfile."""

    office = ndb.StringProperty(required=True)
    email = ndb.StringProperty()
    phone = ndb.StringProperty()
    branch_line = ndb.StringProperty()
    institution_key = ndb.StringProperty(required=True)
    color = ndb.StringProperty()

    def make(self):
        """Make the Institution Profile json."""
        institution = ndb.Key(urlsafe=self.institution_key).get()
        profile = {}
        profile['office'] = self.office
        profile['email'] = self.email
        profile['phone'] = self.phone
        profile['branch_line'] = self.branch_line
        profile['institution'] = {
            'name': institution.name,
            'photo_url': institution.photo_url
        }

        profile['color'] = self.color or pick_color()
        profile['institution_key'] = self.institution_key
        return profile

    @staticmethod
    def is_valid(profiles):
        """Verify the new user profile."""
        new_profile = profiles[len(profiles) - 1]
        if new_profile.office:
            return True
        return False

    @staticmethod
    def create(data):
        """Create an institution profile model instance."""
        for prop in ['office', 'institution_name',
                     'institution_key', 'institution_photo_url']:
            if(not data.get(prop)):
                raise FieldException(
                    "The %s property is missing in data profile" % prop
                )

        profile = InstitutionProfile()
        profile.office = data.get('office')
        profile.email = data.get('email')
        profile.phone = data.get('phone')
        profile.branch_line = data.get('branch_line')
        profile.institution_name = data.get('institution_name')
        profile.institution_photo_url = data.get('institution_photo_url')
        profile.institution_key = data.get('institution_key')

        return profile


class User(ndb.Model):
    """Model of User."""

    name = ndb.StringProperty(required=True)
    cpf = ndb.StringProperty()
    photo_url = ndb.StringProperty(indexed=False)
    email = ndb.StringProperty(repeated=True)

    # The id of the institutions to which the user belongs
    # minimum = 1
    institutions = ndb.KeyProperty(kind="Institution", repeated=True)

    # The id of the institutions followed by the user
    # minimum = 0
    follows = ndb.KeyProperty(kind="Institution", repeated=True)

    # The ids of the institutions administered by the user
    institutions_admin = ndb.KeyProperty(kind="Institution", repeated=True)

    # Notifications received by the user
    notifications = ndb.JsonProperty(repeated=True, indexed=False)

    # The id of the posts authored by the user
    posts = ndb.KeyProperty(kind="Post", repeated=True)

    # TODO: First version don't have timeline.
    # @author: Mayza Nunes 22/05/2017
    # timeline = ndb.KeyProperty(kind="Timeline")

    state = ndb.StringProperty(choices=set([
        'pending',
        'active',
        'inactive'
    ]), default='pending')

    # Post likeds
    liked_posts = ndb.KeyProperty(kind="Post", repeated=True)

    # Images uploaded
    uploaded_images = ndb.StringProperty(repeated=True, indexed=False)

    # The user permissions to access system resources
    permissions = ndb.JsonProperty(indexed=False, default={})

    # The user's profiles
    institution_profiles = ndb.StructuredProperty(InstitutionProfile, repeated=True)

    @staticmethod
    def get_by_email(email):
        """Get user by email."""
        query = User.query(User.email == email)
        user = query.get()
        return user

    def follow(self, institution_key):
        """Add one institution in collection of follows."""
        if institution_key not in self.follows:
            self.follows.append(institution_key)
            self.put()

    def unfollow(self, institution):
        """Remove one institution in collection of follows."""
        if (institution in self.follows and
                institution not in self.institutions):
            self.follows.remove(institution)
            self.put()

    def remove_institution(self, institution):
        """Remove an institution from institutions."""
        if institution in self.institutions:
            if institution in self.institutions_admin:
                self.institutions_admin.remove(institution)
            self.institutions.remove(institution)
            self.remove_permission('publish_post', institution.urlsafe())
            self.remove_permission('publish_survey', institution.urlsafe())
            self.remove_profile(institution.urlsafe())
            if len(self.institutions) == 0:
                self.change_state('inactive')
            self.put()

    def remove_profile(self, institution_key):
        """Remove a profile."""
        for profile in self.institution_profiles:
            if profile.institution_key == institution_key:
                self.institution_profiles.remove(profile)
                break

    def create_and_add_profile(self, data):
        """Create and add profile."""
        user_profile = InstitutionProfile.create(data)
        self.institution_profiles.append(user_profile)

        self.put()
    
    @staticmethod
    def create(name, email):
        """Create user."""
        user = User()
        user.email = email
        user.name = name
        user.photo_url = "app/images/avatar.png"
        health_ministry = get_health_ministry()
        deciis = get_deciis()
        """"TODO: All users have to follow MS and DECIIS
            Think of a better way to do it
            @author: Mayza Nunes 24/01/2018
        """
        if health_ministry is not None:
            follow_inst(user, health_ministry)
        if deciis is not None:
            follow_inst(user, deciis)
        user.put()
        
        return user

    def add_post(self, post):
        user = self.key.get()
        user.posts.append(post.key)
        user.add_permissions(["edit_post", "remove_post"], post.key.urlsafe())
        user.put()

    def is_liked_post(self, postKey):
        """Verify if post is liked."""
        return postKey in self.liked_posts

    def like_post(self, postKey):
        """Method to give like in post."""
        if not self.is_liked_post(postKey):
            self.liked_posts.append(postKey)
            self.put()

    def dislike_post(self, postKey):
        """Method to deslike a post."""
        if self.is_liked_post(postKey):
            self.liked_posts.remove(postKey)
            self.put()

    def add_institution(self, institution_key):
        """Add a institution to user."""
        if institution_key not in self.institutions:
            self.institutions.append(institution_key)
            self.add_permission("publish_post", institution_key.urlsafe())
            self.add_permission("publish_survey", institution_key.urlsafe())
            self.put()

    def add_institution_admin(self, institution_key):
        """Add a institution_key in institutions admin list of user."""
        if institution_key not in self.institutions_admin and institution_key in self.institutions:
            self.institutions_admin.append(institution_key)
            self.put()

    def add_image(self, url_image):
        """Add images in list of uploaded images."""
        self.uploaded_images.append(url_image)
        self.put()

    def change_state(self, state):
        """Change the user state."""
        self.state = state
        self.put()

    def add_permission(self, permission_type, entity_key):
        """Add new permission.key to the user permissions list.

        Arguments:
        permission_type -- permission name that will be used to verify authorization
        entity_key -- ndb urlsafe of the object binded to the permission
        """
        if self.permissions.get(permission_type, None):
            self.permissions[permission_type][entity_key] = True
        else:
            self.permissions[permission_type] = {entity_key: True}
        self.put()

    def add_permissions(self, list_permissions, entity_key):
        """Add new permissions to the user permissions list.

        Arguments:
        list_permissions -- permissions list to be added
        entity_key -- ndb urlsafe of the object binded to the permission
        """
        for permission in list_permissions:
            self.add_permission(permission, entity_key)

    def remove_permission(self, permission_type, entity_key):
        """Remove permission.key from the user permissions list.

        Arguments:
        permission_type -- permission name used to verify authorization
        entity_key -- ndb urlsafe of the object binded to the permission
        """
        if self.permissions.get(permission_type, {}).get(entity_key):
            del self.permissions[permission_type][entity_key]
            self.put()
    
    def remove_permissions(self, list_permissions, entity_key):
        """
        Remove permissions to the user permissions list.

        Arguments:
        list_permissions -- permissions list to be removed
        entity_keys -- ndb urlsafe of the object binded to the permission
        """
        for permission in list_permissions:
            self.remove_permission(permission, entity_key)
    
    def remove_institution_admin(self, institution_key):
        """Remove a institution admin to user."""
        if institution_key in self.institutions_admin:
            self.institutions_admin.remove(institution_key)
            self.put()

    def has_permission(self, permission_type, entity_key=None):
        """Verify if user has permission on determinate entity.

        Arguments:
        permission_type -- permission name that will be used to verify authorization
        entity_key -- ndb urlsafe of the object binded to the permission
        """
        try:
            if entity_key:
                if self.permissions[permission_type][entity_key]:
                    return True
            return False
        except:
            return False

    def check_permission(self, permission_type, message_exception, entity_key=None):
        """Throw exception when user hasn't permission.

        Arguments:
        permission_type -- permission name that will be used to verify authorization
        message_exception -- to be throwed when no user is not allowed
        entity_key -- ndb urlsafe of the object binded to the permission
        """
        if self.has_permission(permission_type, entity_key):
            return True
        else:
            raise NotAuthorizedException(message_exception)

    def disable_account(self):
        """Desable user account.

        When user is patched to inactive state, this function is called
        to remove all his institutions.
        """
        self.institutions = []
        self.follows = []
        self.permissions = {}
        self.put()
        
    def _post_put_hook(self, future):
        """This method is called after each User.put()."""
        search_user = SearchUser()
        search_user.createDocument(future.get_result().get())

    @staticmethod
    def get_active_user(user_email):
        """Get active user if exists."""
        user_found = User.query(User.email == user_email).iter()

        if user_found.has_next():
            user_found = user_found.next()
            if user_found.state == 'active':
                return user_found

    def is_member(self, institution_key):
        """Verify if the institution is part of the
        institutions list that the user belongs."""
        return institution_key in self.institutions

    def is_admin(self, institution_key):
        return institution_key in self.institutions_admin
