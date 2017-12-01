"""Mocks' file."""

from models.user import User
from models.institution import Institution
from models.post import Post
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


def create_user():
    """Create user function."""
    user = User()
    user_hash = getHash(user)
    user.name = "User %s" % user_hash
    user.email = ["user%s@email.com" % user_hash]
    user.put()
    return user


def create_institution():
    """Create institution function."""
    institution = Institution()
    inst_hash = getHash(institution)
    institution.name = "Inst %s" % inst_hash
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
