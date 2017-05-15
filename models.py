from google.appengine.ext import ndb


class Institution(ndb.Model):
    name = ndb.StringProperty(required=True)


class User(ndb.Model):
    name = ndb.StringProperty(required=True)


class Post(ndb.Model):
    content = ndb.TextProperty(required=True)
