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

    #Posts created by members of this institution
    posts = ndb.KeyProperty(kind="Post", repeated=True)

    #
    #timeline = ndb.KeyProperty(kind="Timeline")

    state = ndb.StringProperty(choices=set([
        'pending',
        'active',
        'inactive'
    ]), default='pending')

    @staticmethod
    def get_all(add=[], remove=[]):
        query = Institution.query()
        data = []
        for institution in query.fetch():
            pdict = institution.to_dict() 
            for prop in add:
                pdict[prop] = getattr(institution, prop)
            for prop in remove:
                del pdict[prop]
            data.append(pdict)

        return data

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

class Post(ndb.Model):
	title = ndb.StringProperty(required=True)

	content = ndb.TextProperty(required=True)

	# user who is the author
	author = ndb.KeyProperty(kind="User", required=True)

	# institution to which this post belongs
	institution = ndb.KeyProperty(kind="Institution")

	state = ndb.StringProperty(choices=set([
		'draft',
		'published',
		'deleted'
	]), default='draft')

	# Comments of the post
	# Concurrency controlled by Transactions
	comments = ndb.JsonProperty(repeated=True)

	#date and time of a creation of a post 
	publication_date = ndb.DateTimeProperty(auto_now_add=True)

	#number of likes 
	likes = ndb.IntegerProperty(default=0)