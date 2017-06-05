
"""Post Model."""
from google.appengine.ext import ndb

from utils import Utils

import datetime
import sys


def commentsToJsonList(comments):
    """Convert comments into a json list."""
    jsonList = [Utils.toJson(comment.to_dict()) for comment in comments]
    return jsonList


def getHash(obj):
    """Generate a hash to an object."""
    if type(obj) is not dict:
        obj = obj.to_dict()

    return hash(tuple(obj.items())) % (sys.maxint * 2)


class Comment(ndb.Model):
    """Model of a Comment."""

    # comment's text
    text = ndb.StringProperty(required=True)

    # date and time of the comment creation
    publication_date = ndb.DateTimeProperty(auto_now_add=True)

    # user who is the author
    author = ndb.KeyProperty(kind="User", required=True)

    id = ndb.IntegerProperty()

    @staticmethod
    def create(data, author):
        """Create a comment and check required fields."""
        if not data['text']:
            raise Exception("Field text can not be empty")

        comment = Comment()
        comment.text = data['text']
        comment.author = author
        comment.publication_date = datetime.datetime.now()
        comment.id = getHash(comment)

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
            'publication_date': publication_date,
            'id': comment.id
        }

    def __eq__(self, other):
        """Compare two Comment objects."""
        if isinstance(other, self.__class__):
            return self.__dict__ == other.__dict__
        return False


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
            'comments': commentsToJsonList(post.comments),
            'publication_date': publication_date,
            'author_key': author.key.urlsafe(),
            'institution_key': institution.key.urlsafe(),
            'key': post.key.urlsafe()
        }

    def add_comment(self, comment):
        """Add a comment to the post."""
        self.comments.append(comment)
        self.put()

    def remove_comment(self, comment):
        """Remove a commet from post."""
        self.comments = [c for c in self.comments if c.id != id]
        self.put()

    def like(self):
        """Increment one 'like' in post."""
        self.likes += 1
        self.put()

    def deslike(self):
        """Decrease one 'like' in post."""
        self.likes -= 1
        self.put()
