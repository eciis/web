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

    # Images uploaded
    uploaded_images = ndb.StringProperty(repeated=True)

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

    def unfollow(self, institution):
        """Remove one institution in collection of follows."""
        if (institution in self.follows and
                institution not in self.institutions):
            self.follows.remove(institution)
            self.put()

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
        if institution_key not in self.institutions:
            self.institutions.append(institution_key)
            self.put()

    def add_image(self, url_image):
        """Add images in list of uploaded images."""
        self.uploaded_images.append(url_image)
        self.put()
