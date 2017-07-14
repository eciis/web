"""Institution Model."""
from google.appengine.ext import ndb


class Institution(ndb.Model):
    """Model of Institution."""

    name = ndb.StringProperty(required=True)

    cnpj = ndb.StringProperty()

    legal_nature = ndb.StringProperty(
        choices=set(["public", "private", "philanthropic"]))

    address = ndb.StringProperty()

    occupation_area = ndb.StringProperty()

    description = ndb.TextProperty()

    image_url = ndb.StringProperty()

    email = ndb.StringProperty()

    phone_number = ndb.StringProperty()

    # The admin user of this institution
    admin = ndb.KeyProperty(kind="User")

    # The parent institution
    # Value is None for institutions without parent
    # User query to retrieve children institutions
    parent_institution = ndb.KeyProperty(kind="Institution")

    # The children institution
    # Value is None for institutions without children
    children_institution = ndb.KeyProperty(kind="Institution", repeated=True)

    # The institutions are waiting to be accept as children
    # Value is None for institutions without children waiting accept
    children_institution_pedding = ndb.KeyProperty(kind="Institution", repeated=True)

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

    def add_member(self, member_key):
        if member_key not in self.members:
            self.members.append(member_key)
            self.put()

    @staticmethod
    def create_parente_inst_stub(invite):
        """Create a stub of institution."""
        institution = Institution()
        institution.name = invite.suggestion_institution_name
        institution.state = 'pending'
        institution.children_institution = [invite.institution_key]
        institution.put()

        return institution
