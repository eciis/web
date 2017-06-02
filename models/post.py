
"""Post Model."""
from google.appengine.ext import ndb

from utils import Utils

import datetime


def commentsToJsonList(comments):
    """Convert comments into a json list."""
    jsonList = [Utils.toJson(comment.to_dict()) for comment in comments]
    return jsonList


class Comment(ndb.Model):
    """Model of a Comment."""

    # comment's text
    text = ndb.StringProperty(required=True)

    # date and time of the comment creation
    publication_date = ndb.DateTimeProperty(auto_now_add=True)

    # user who is the author
    author = ndb.KeyProperty(kind="User", required=True)

    @staticmethod
    def create(data, author):
        """Create a comment and check required fields."""
        if not data['text']:
            raise Exception("Field text can not be empty")

        comment = Comment()
        comment.text = data['text']
        comment.author = author

        return comment

    @staticmethod
    def reCreate(data, author, publication_date):
        """Recreate a comment."""
        comment = Comment.create(data, author)
        comment.publication_date = datetime.datetime.strptime(publication_date, "%Y-%m-%dT%H:%M:%S.%f")
        # TODO: verify if the date is overided on backend

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
            'publication_date': publication_date
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
        if self.comments:
            self.comments.append(comment)
        else:
            self.comments = [comment]
        self.put()

    def remove_comment(self, comment):
        """Remove a commet from post."""
        self.comments.remove(comment)
        self.put()

    def like(self):
        """Increment one 'like' in post."""
        self.likes += 1
        self.put()

    def deslike(self):
        """Decrease one 'like' in post."""
        self.likes -= 1
        self.put()
