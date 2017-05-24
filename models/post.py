
"""Post Model."""
from google.appengine.ext import ndb


class Post(ndb.Model):
    """Model of a post."""

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

    # Date and time of a creation of a post
    publication_date = ndb.DateTimeProperty(auto_now_add=True)

    # Number of likes
    likes = ndb.IntegerProperty(default=0)

    @staticmethod
    def create(data, author, institution):
        """Create a post and check required fields."""
        if not data['title']:
            raise Exception("Field title can not be empty")
        if not data['text']:
            raise Exception("Field text can not be empty")
        post = Post()
        post.title = data['title']
        post.headerImage = data.get('headerImage')
        post.text = data['text']
        post.author = author
        post.institution = institution
        post.comments = []

        return post

    @staticmethod
    def make(post):
        """Create personalized json of post."""
        publication_date = post.publication_date.isoformat()
        author = post.author.get()
        institution = post.institution.get()
        return {
            'title': post.title,
            'text': post.text,
            'author': author.name,
            'author_img': author.photo_url,
            'institution_name': institution.name,
            'institution_image': institution.image_url,
            'likes': post.likes,
            'headerImage': post.headerImage,
            'state': post.state,
            'comments': post.comments,
            'publication_date': publication_date
        }
