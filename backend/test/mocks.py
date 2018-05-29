"""Mocks' file."""

import datetime
import sys

from models import User
from models import Institution
from models import Address
from models import Post
from models import Comment
from models import Event
from models import InviteFactory
from permissions import DEFAULT_ADMIN_PERMISSIONS
from models import RequestInstitutionParent


def getHash(obj):
    """Generate a hash to an object."""
    if type(obj) is not dict:
        obj = obj.to_dict()
    obj['date'] = datetime.datetime.now()
    for key in obj:
        if type(obj[key]) is list or type(obj[key]) is dict:
            obj[key] = tuple(obj[key])
    hash_num = hash(tuple(obj.items())) % (sys.maxint)
    return str(hash_num)


def create_user(email=None):
    """Create user function."""
    user = User()
    user_hash = getHash(user)
    user.name = "User %s" % user_hash
    user.email = [email or "user%s@email.com" % user_hash]
    user.put()
    return user


def create_address():
    address = Address()
    address_hash = getHash(address)
    address.number = "%s" % address_hash
    address.street = "street %s" % address_hash
    address.neighbourhood = "neighbourhood %s" % address_hash
    address.city = "city %s" % address_hash
    address.federal_state = "federal_state %s" % address_hash
    address.cep = "cep %s" % address_hash
    address.country = "country %s" % address_hash
    return address


def create_institution(name=None):
    """Create institution function."""
    institution = Institution()
    inst_hash = getHash(institution)
    institution.name = name or "Inst %s" % inst_hash
    institution.address = create_address()
    institution.description = "description"
    institution.institutional_email = "%s@email.com" %inst_hash
    institution.put()
    return institution


def create_post(author_key, institution_key):
    """Create post."""
    post = Post()
    post.author = author_key
    post.institution = institution_key
    post_hash = getHash(post)
    post.title = "title %s" % post_hash
    post.text = "text %s" % post_hash
    post.last_modified_by = author_key
    post.put()
    # update permissions
    author = author_key.get()
    author.add_permissions(["edit_post", "remove_post"], post.key.urlsafe())
    author.put()
    post.put()
    return post


def create_comment(institution_key_urlsafe, author):
    """Create a comment."""
    data = {
        'text': 'text-',
        'institution_key': institution_key_urlsafe
    }
    comment = Comment.create(data, author)
    comment.text += comment.id
    return comment


def create_event(author, institution):
    """Create an event."""
    data = {
        'title': 'title ',
        'local': 'location ',
        'start_time': datetime.datetime.now().strftime("%Y-%m-%dT%H:%M:%S"),
        'end_time': (datetime.datetime.now() + datetime.timedelta(days=1)).strftime("%Y-%m-%dT%H:%M:%S"),
        'address': {}
    }
    event = Event.create(data, author, institution)
    event_hash = getHash(event)
    event.title += event_hash
    event.local += event_hash
    event.author_photo = event_hash
    event.institution_image = event_hash
    event.put()
    return event

def create_invite(admin, institution_key, type_of_invite, invitee_key=None):
    """Create an invite."""
    data = {
        'invitee': str(admin.email),
        'admin_key': admin.key.urlsafe(),
        'institution_key': institution_key.urlsafe(),
        'suggestion_institution_name': 'inst_test'
    }

    if invitee_key:
        data['invitee_key'] = invitee_key

    invite = InviteFactory.create(data, type_of_invite)
    invite_hash = getHash(invite)
    invite.sender_name = invite_hash
    invite.put()
    return invite

def generate_child_to_parent(parent, child_admin=None):
    """Create a child for the parent."""
    admin = create_user() if child_admin is None else child_admin
    child = create_institution()
    child.add_member(admin)
    child.set_admin(admin.key)
    admin.add_permissions(DEFAULT_ADMIN_PERMISSIONS, child.key.urlsafe())
    data = {
        'sender_key': admin.key.urlsafe(),
        'institution_requested_key': parent.key.urlsafe(),
        'admin_key': admin.key.urlsafe(),
        'institution_key': child.key.urlsafe()
    }
    parent_invite = RequestInstitutionParent.create(data)
    # link child_a to institution
    Institution.create_parent_connection(parent, parent_invite)
    #  update child
    child = child.key.get()
    return child