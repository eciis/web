
"""Post Model."""
from google.appengine.ext import ndb
from custom_exceptions.fieldException import FieldException
from custom_exceptions.notAuthorizedException import NotAuthorizedException

from utils import Utils


import datetime


def getCommentsUri(post, host):
    """Create uri to access post comments."""
    return "http://%s/api/posts/%s/comments" % (host, post.key.urlsafe())


def getLikesUri(post, host):
    """Create uri to access post likes."""
    return "http://%s/api/posts/%s/likes" % (host, post.key.urlsafe())


class Comment(ndb.Model):
    """Model of a Comment."""

    # comment's text
    text = ndb.TextProperty(required=True)

    # date and time of the comment creation
    publication_date = ndb.DateTimeProperty(auto_now_add=True)

    # user who is the author
    author = ndb.KeyProperty(kind="User", required=True)

    # institution which the author is representing
    institution_name = ndb.StringProperty(required=True)

    # Post from which the comment belongs
    post = ndb.KeyProperty(kind="Post", required=True)

    # comment's id
    id = ndb.StringProperty(required=True)

    @staticmethod
    def create(data, author_key, post_key):
        """Create a comment and check required fields."""
        if not data['text']:
            raise FieldException("Text can not be empty")
        if not data['institution_key']:
            raise FieldException("Institution can not be empty")

        institution = ndb.Key(urlsafe=data['institution_key']).get()
        Utils._assert(institution.state == 'inactive',
                      "The institution has been deleted", NotAuthorizedException)
        comment = Comment()
        comment.text = data['text']
        comment.author = author_key
        comment.post = post_key
        comment.publication_date = datetime.datetime.now()
        comment.institution_name = institution.name
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
            'institution_name': comment.institution_name,
            'author_img': author.photo_url,
            'author_key': author.key.urlsafe(),
            'post_key': comment.post.urlsafe(),
            'publication_date': publication_date,
            'id': comment.id
        }


class Like(ndb.Model):
    """Model of a Like."""

    author = ndb.KeyProperty(kind="User", required=True)

    id = ndb.StringProperty(required=True)

    @staticmethod
    def make(like, host):
        """Create a json of like."""
        author = like.author.get()
        return {
            'author': author.name,
            'author_img': author.photo_url,
            'id': like.id
        }


class Post(ndb.Model):
    """Model of a post."""

    title = ndb.StringProperty()

    photo_url = ndb.StringProperty()

    text = ndb.TextProperty()

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

    # user who deleted the post
    last_modified_by = ndb.KeyProperty(kind="User")

    # Date and time of last modified
    last_modified_date = ndb.DateTimeProperty(auto_now=True)

    # Likes of Post
    likes = ndb.LocalStructuredProperty(Like, repeated=True)

    # Images uploaded
    uploaded_images = ndb.StringProperty(repeated=True)

    # When post is shared post
    shared_post = ndb.KeyProperty(kind="Post")

    @staticmethod
    def create(data, author_key, institution_key):
        """Create a post and check required fields."""
        post = Post()

        if data.get('shared_post') is None:
            if not data['title']:
                raise FieldException("Title can not be empty")
            if not data['text']:
                raise FieldException("Text can not be empty")
        else:
            post.shared_post = ndb.Key(urlsafe=data["shared_post"])

        post.title = data.get('title')
        post.photo_url = data.get('photo_url')
        post.text = data.get('text')
        post.last_modified_by = author_key
        post.author = author_key
        post.institution = institution_key
        post.comments = []

        return post

    @staticmethod
    def make(post, host):
        """Create personalized json of post."""
        publication_date = post.publication_date.isoformat()
        last_modified_date = post.last_modified_date.isoformat()
        author = post.author.get()
        last_modified_by = post.last_modified_by.get()
        institution = post.institution.get()
        post_dict = {
            'title': post.title,
            'text': post.text,
            'author': author.name,
            'author_img': author.photo_url,
            'institution_name': institution.name,
            'institution_image': institution.photo_url,
            'likes': getLikesUri(post, host),
            'number_of_likes': post.get_number_of_likes(),
            'photo_url': post.photo_url,
            'uploaded_images': post.uploaded_images,
            'state': post.state,
            'comments': getCommentsUri(post, host),
            'number_of_comments': post.get_number_of_comment(),
            'publication_date': publication_date,
            'last_modified_date': last_modified_date,
            'author_key': author.key.urlsafe(),
            'last_modified_by': last_modified_by.name,
            'institution_key': institution.key.urlsafe(),
            'key': post.key.urlsafe()
        }
        return post.modify_post(post_dict, host)

    def modify_post(post, post_dict, host):
        """Create personalized json if post was deleted or is shared."""
        if(post.state == 'deleted'):
            post_dict['title'] = None
            post_dict['text'] = None

        if(post.shared_post):
            post_dict['shared_post'] = Post.make(post.shared_post.get(), host)

        return post_dict

    def get_comment(self, comment_id):
        """Get a comment by id."""
        for comment in self.comments:
            if comment.id == comment_id:
                return comment
        return None

    def get_number_of_comment(self):
        """Get number of comments."""
        return len(self.comments)

    def add_comment(self, comment):
        """Add a comment to the post."""
        self.comments.append(comment)
        self.put()

    def remove_comment(self, comment_id):
        """Remove a commet from post."""
        self.comments = [comment for comment in self.comments
                         if comment.id != comment_id]
        self.put()

    def get_like(self, author_key):
        """Get a like by author key."""
        for like in self.likes:
            if like.author == author_key:
                return like

    def get_number_of_likes(self):
        """Get the number of likes in this post."""
        return len(self.likes)

    def like(self, author_key):
        """Increment one 'like' in post."""
        if self.get_like(author_key) is None:
            like = Like()
            like.author = author_key
            like.id = Utils.getHash(like)
            self.likes.append(like)
            self.put()

    def dislike(self, author_key):
        """Decrease one 'like' in post."""
        like = self.get_like(author_key)
        if like:
            self.likes.remove(like)
            self.put()

    def delete(self, user):
        """Change the state and add the information about this."""
        self.last_modified_by = user.key
        self.state = 'deleted'

        """Update the post in datastore."""
        self.put()

    def has_activity(self):
        """Check if the post has comments or likes."""
        has_comments = len(self.comments) > 0
        has_likes = len(self.likes) > 0
        return has_comments or has_likes
