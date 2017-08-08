"""Institution Model."""
from google.appengine.ext import ndb

import search_module


def get_occupation_area(data):
    """Get the institution occupation area."""
    if data.get('occupation_area') == 'other':
        return data.get('other_area')
    return data.get('occupation_area')


class Institution(ndb.Model):
    """Model of Institution."""

    name = ndb.StringProperty(required=True)

    acronym = ndb.StringProperty()

    cnpj = ndb.StringProperty()

    legal_nature = ndb.StringProperty(
        choices=set(["public", "private", "philanthropic"]))

    address = ndb.StringProperty()

    occupation_area = ndb.StringProperty()

    description = ndb.TextProperty()

    photo_url = ndb.StringProperty()

    email = ndb.StringProperty()

    phone_number = ndb.StringProperty()

    # The admin user of this institution
    admin = ndb.KeyProperty(kind="User")

    # The parent institution
    # Value is None for institutions without parent
    # User query to retrieve children institutions
    parent_institution = ndb.KeyProperty(kind="Institution")

    # The children institutions
    # Value is None for institutions without children
    children_institutions = ndb.KeyProperty(kind="Institution", repeated=True)

    # The institutions are waiting to be accept as children
    # Value is None for institutions without children waiting accept
    children_institutions_pedding = ndb.KeyProperty(kind="Institution", repeated=True)

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

    def follow(self, user):
        """Add one user in collection of followers."""
        if user not in self.followers:
            self.followers.append(user)
            self.put()

    def unfollow(self, user):
        """Remove one user in collection of followers."""
        if user in self.followers and user not in self.members:
            self.followers.remove(user)
            self.put()

    def add_member(self, member):
        """Add a new member to the institution."""
        if member.key not in self.members:
            self.members.append(member.key)
            self.put()

    @staticmethod
    @ndb.transactional(xg=True)
    def create_parent_connection(institution, invite):
        """Makes connections between parent and daughter institution."""
        institution.children_institutions = [invite.institution_key]
        institution.put()

        institution_children = invite.institution_key.get()
        institution_children.parent_institution = institution.key
        institution_children.put()

        return institution

    @staticmethod
    @ndb.transactional(xg=True)
    def create_children_connection(institution, invite):
        """Makes connections between daughter and parent institution."""
        institution.parent_institution = invite.institution_key
        institution.put()

        parent_institution = invite.institution_key.get()
        parent_institution.children_institutions.append(institution.key)
        parent_institution.put()

        return institution

    @staticmethod
    @ndb.transactional(xg=True)
    def create_inst_stub(invite):
        """Create a stub of institution."""
        institution_stub = Institution()
        institution_stub.name = invite.suggestion_institution_name
        institution_stub.state = 'pending'

        institution_stub.put()
        search_module.createDocument(
            institution_stub.key.urlsafe(), institution_stub.name,
            institution_stub.state, invite.invitee)

        return institution_stub

    def createInstitutionWithStub(self, user, inviteKey, institution):
        invite = ndb.Key(urlsafe=inviteKey).get()

        invite.status = 'accepted'
        invite.put()

        institution.admin = user.key
        institution.members.append(user.key)
        institution.followers.append(user.key)
        institution.state = 'active'
        if (institution.photo_url is None):
            institution.photo_url = "/images/institution.jpg"
        institution.put()

        user.institutions.append(institution.key)
        user.institutions_admin.append(institution.key)
        user.state = "active"
        user.follows.append(institution.key)
        user.put()

        return institution

    def make(self, attributes):
        """Create an institution dictionary with specific filds."""
        institution = {}
        for attribute in attributes:
            attr_value = getattr(self, attribute)
            if(isinstance(attr_value, ndb.Key)):
                attr_value = self.key.urlsafe()
            institution[attribute] = attr_value
        return institution
