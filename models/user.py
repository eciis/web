"""User Model."""
from google.appengine.ext import ndb


class User(ndb.Model):
    """Model of User."""

    name = ndb.StringProperty(required=True)
    cpf = ndb.StringProperty()
    photo_url = ndb.StringProperty()
    email = ndb.StringProperty()

    # The id of the institutions to which the user belongs
    # minimum = 1
    institutions = ndb.KeyProperty(kind="Institution", repeated=True)

    # The id of the institutions followed by the user
    # minimum = 0
    follows = ndb.KeyProperty(kind="Institution", repeated=True)

    # The ids of the institutions administered by the user
    institutions_admin = ndb.KeyProperty(kind="Institution", repeated=True)

    # Notifications received by the user
    notifications = ndb.JsonProperty(repeated=True)

    # The id of the posts authored by the user
    posts = ndb.KeyProperty(kind="Post", repeated=True)

    # TODO: First version don't have timeline. Do After
    # The id of the user timeline
    # @author: Mayza Nunes 22/05/2017
    # timeline = ndb.KeyProperty(kind="Timeline")

    state = ndb.StringProperty(choices=set([
        'pending',
        'active',
        'inactive'
    ]), default='pending')

    # Post likeds
    liked_posts = ndb.KeyProperty(kind="Post", repeated=True)

    @staticmethod
    def get_by_email(email):
        """Get user by email."""
        query = User.query(User.email == email)
        user = query.get()
        return user

    def follow(self, institution):
        """Add one institution in collection of follows."""
        if institution not in self.follows:
            self.follows.append(institution)
            self.put()

    def like_post(self, postKey):
        """Method to give like in post."""
        if postKey not in self.liked_posts:
            self.liked_posts.append(postKey)
            self.put()

    def deslike_post(self, postKey):
        """Method to deslike a post."""
        if postKey in self.liked_posts:
            self.liked_posts.remove(postKey)
            self.put()
