"""Institution Model."""
from google.appengine.ext import ndb
from custom_exceptions.fieldException import FieldException


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

    image_url = ndb.StringProperty()

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
        """Add a new member to the institution."""
        if member_key not in self.members:
            self.members.append(member_key)
            self.put()

    @staticmethod
    @ndb.transactional(xg=True)
    def create_parent_inst_stub(invite):
        """Create a stub of institution."""
        institution = Institution()
        institution.name = invite.suggestion_institution_name
        institution.state = 'pending'
        institution.children_institutions = [invite.institution_key]
        institution.put()

        institution_children = invite.institution_key.get()
        institution_children.parent_institution = institution.key
        institution_children.put()

        return institution

    @staticmethod
    def create(data, user):
        """Create a new Institution."""
        for field in ['name']:
            if not data.get(field):
                raise FieldException(field + " can not be empty")

        omsImage = "http://eciis-splab.appspot.com/images/oms.png"
        institution = Institution()
        institution.name = data.get('name')
        institution.acronym = data.get('acronym')
        institution.cnpj = data.get('cnpj')
        institution.legal_nature = data.get('legal_nature')
        institution.address = data.get('address')
        institution.occupation_area = get_occupation_area(data)
        institution.description = data.get('description')
        institution.phone_number = data.get('phone_number')
        institution.email = data.get('email')
        institution.image_url = data.get('image_url') or omsImage
        institution.admin = user.key
        institution.members.append(user.key)
        institution.followers.append(user.key)
        institution.state = data.get('state')
        institution.put()

        user.institutions.append(institution.key)
        user.institutions_admin.append(institution.key)
        user.follows.append(institution.key)
        user.put()

        return institution
