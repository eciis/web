"""Mocks' file."""

from models.user import User
from models.institution import Institution
from models.institution import Address
from models.post import Post
from models.event import Event
import datetime
import sys


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


def create_institution():
    """Create institution function."""
    institution = Institution()
    inst_hash = getHash(institution)
    institution.name = "Inst %s" % inst_hash
    institution.address = create_address()
    institution.description = "description"
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
    post.put()
    return post


def create_event(author_key, institution_key):
    """Create post."""
    event = Event()
    event.author_key = author_key
    event.institution_key = institution_key
    event_hash = getHash(event)
    event.title = "title %s" % event_hash
    event.start_time = datetime.datetime.now()
    event.end_time = datetime.datetime.now()
    event.author_photo = event_hash
    event.author_name = event_hash
    event.institution_name = event_hash
    event.institution_image = event_hash
    event.local = event_hash
    event.put()
    return event
