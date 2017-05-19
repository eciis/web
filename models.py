from google.appengine.ext import ndb


class Institution(ndb.Model):
    name = ndb.StringProperty(required=True)

    cnpj = ndb.StringProperty()
    
    legal_nature = ndb.StringProperty(choices=set(["public", "private", "philanthropic"]))
    
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

    # The ids of users who are members of this institution
    members = ndb.KeyProperty(kind="User", repeated=True)

    # Users subscribed to this institution's posts
    # All these followers receive copies of the posts
    # of this institution in their timeline.
    followers = ndb.KeyProperty(kind="User", repeated=True)

    # Posts created by members of this institution
    posts = ndb.KeyProperty(kind="Post", repeated=True)

    #
    # timeline = ndb.KeyProperty(kind="Timeline")

    state = ndb.StringProperty(choices=set([
        'pending',
        'active',
        'inactive'
    ]), default='pending')


class User(ndb.Model):
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

    # The id of the user timeline
    #timeline = ndb.KeyProperty(kind="Timeline")

    state = ndb.StringProperty(choices=set([
        'pending',
        'active',
        'inactive'
    ]), default='pending')

    @staticmethod
    def get_by_email(email):
        query = User.query(User.email == email)
        user = query.get()
        return user


class Post(ndb.Model):
    title = ndb.StringProperty(required=True)
    
    headerImage = ndb.StringProperty()

    text = ndb.TextProperty(required=True)

    # user who is the author
    author = ndb.KeyProperty(kind="User", required=True)

    # institution to which this post belongs
    institution = ndb.KeyProperty(kind="Institution", required=True)

    state = ndb.StringProperty(choices=set([
        'draft',
        'published',
        'deleted'
    ]), default='draft')

    # Comments of the post
    # Concurrency controlled by Transactions
    comments = ndb.JsonProperty(repeated=True)

    # date and time of a creation of a post 
    publication_date = ndb.DateTimeProperty(auto_now_add=True)

    # number of likes 
    likes = ndb.IntegerProperty(default=0)

class Timeline(ndb.Model):

    # TODO: In the future think about maximum size of the entity
    # The data of the posts
    # The only required data is the Post Key/id
    # Ordered by the datetime (most recent first)
    posts = ndb.JsonProperty(repeated=True, compressed=True)