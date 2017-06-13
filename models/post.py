
"""Post Model."""
from google.appengine.ext import ndb

from utils import Utils

import datetime


class FieldException(Exception):
    """Field Exception."""

    def __init__(self, msg=None):
        """Class constructor."""
        super(FieldException, self).__init__(msg or "Invalid field")


def getCommentsUri(post, host):
    """Create uri to access post comments."""
    return "http://%s/api/post/%s/comment" % (host, post.key.urlsafe())


class Comment(ndb.Model):
    """Model of a Comment."""

    # comment's text
    text = ndb.StringProperty(required=True)

    # date and time of the comment creation
    publication_date = ndb.DateTimeProperty(auto_now_add=True)

    # user who is the author
    author = ndb.KeyProperty(kind="User", required=True)

    # Post from which the comment belongs
    post = ndb.KeyProperty(kind="Post", required=True)

    # comment's id
    id = ndb.StringProperty(required=True)

    @staticmethod
    def create(data, author_key, post_key):
        """Create a comment and check required fields."""
        if not data['text']:
            raise FieldException("Text can not be empty")

        comment = Comment()
        comment.text = data['text']
        comment.author = author_key
        comment.post = post_key
        comment.publication_date = datetime.datetime.now()
        comment.id = Utils.getHash(comment)

        return comment

    @staticmethod
    def make(comment):
        """Create personalized json of comment."""
        publication_date = comment.publication_date.isoformat()
        author = comment.author.get()
        return {
            'text': comment.text,
            'author_name': author.name,
            'author_img': author.photo_url,
            'author_key': author.key.urlsafe(),
            'post_key': comment.post.urlsafe(),
            'publication_date': publication_date,
            'id': comment.id
        }


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
    ]), default='published')

    # Comments of the post
    # Concurrency controlled by Transactions
    comments = ndb.LocalStructuredProperty(Comment, repeated=True)

    # Date and time of a creation of a post
    publication_date = ndb.DateTimeProperty(auto_now_add=True)

    # Number of likes
    likes = ndb.IntegerProperty(default=0)

    @staticmethod
    def create(data, author_key, institution_key):
        """Create a post and check required fields."""
        if not data['title']:
            raise FieldException("Title can not be empty")
        if not data['text']:
            raise FieldException("Text can not be empty")
        post = Post()
        post.title = data['title']
        post.headerImage = data.get('headerImage')
        post.text = data['text']
        post.author = author_key
        post.institution = institution_key
        post.comments = []

        return post

    @staticmethod
    def make(post, host):
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
            'comments': getCommentsUri(post, host),
            'publication_date': publication_date,
            'author_key': author.key.urlsafe(),
            'institution_key': institution.key.urlsafe(),
            'key': post.key.urlsafe()
        }

    def get_comment(self, comment_id):
        """Get a comment by id."""
        for comment in self.comments:
            if comment.id == comment_id:
                return comment
        return None

    def add_comment(self, comment):
        """Add a comment to the post."""
        self.comments.append(comment)
        self.put()

    def remove_comment(self, comment_id):
        """Remove a commet from post."""
        self.comments = [comment for comment in self.comments
                         if comment.id != comment_id]
        self.put()

    def like(self):
        """Increment one 'like' in post."""
        self.likes += 1
        self.put()

    def deslike(self):
        """Decrease one 'like' in post."""
        self.likes -= 1
        self.put()
