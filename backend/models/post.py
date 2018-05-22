
"""Post Model."""
from google.appengine.ext import ndb
from google.appengine.ext.ndb.polymodel import PolyModel
from custom_exceptions import FieldException
from custom_exceptions.notAuthorizedException import NotAuthorizedException
from custom_exceptions import EntityException
from models import Event
from utils import Utils
from service_messages import create_message

import datetime

__all__ = ['Comment','Like','Post']


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
    publication_date = ndb.StringProperty()

    # user who is the author
    author_key = ndb.StringProperty(required=True)

    author_name = ndb.StringProperty(required=True)

    author_img = ndb.StringProperty(required=True)

    # institution which the author is representing
    institution_name = ndb.StringProperty(required=True)

    replies = ndb.JsonProperty()

    likes = ndb.JsonProperty()

    # comment's id
    id = ndb.StringProperty(required=True)

    def add_reply(self, reply):
        self.replies[reply.id] = reply

    @staticmethod
    def create(data, author):
        """Create a comment and check required fields."""
        if not data.get('text'):
            raise FieldException("Text can not be empty")
        if not data.get('institution_key'):
            raise FieldException("Institution can not be empty")

        institution = ndb.Key(urlsafe=data['institution_key']).get()
        Utils._assert(institution.state == 'inactive',
                      "The institution has been deleted",
                      NotAuthorizedException)
        comment = Comment()
        comment.text = data['text']
        comment.author_key = author.key.urlsafe()
        comment.author_name = author.name
        comment.author_img = author.photo_url
        comment.publication_date = datetime.datetime.now().isoformat()
        comment.institution_name = institution.name
        comment.id = Utils.getHash(comment)

        comment.replies = {}
        comment.likes = []

        return comment


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
            'id': like.id,
            'author_key': author.key.urlsafe()
        }


class Post(PolyModel):
    """Model of a post."""

    title = ndb.StringProperty()

    photo_url = ndb.StringProperty()

    pdf_files = ndb.JsonProperty()

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
    comments = ndb.JsonProperty(default={})

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

    # Video url
    video_url = ndb.StringProperty()

    # When post is shared event
    shared_event = ndb.KeyProperty(kind="Event")

    # Users that are interested in the post
    subscribers = ndb.KeyProperty(kind="User", repeated=True)

    def create(post, data, author_key, institution_key):
        """Create a post and check required fields."""
        post = post.createSharing(data)

        if (post.isCommonPost(data)):
            if not data.get('title'):
                raise FieldException("Title can not be empty")
            if not data.get('text'):
                raise FieldException("Text can not be empty")

        post.title = data.get('title')
        post.photo_url = data.get('photo_url')
        post.text = data.get('text')
        post.pdf_files = Utils.toJson(data.get('pdf_files'))
        post.last_modified_by = author_key
        post.author = author_key
        post.institution = institution_key
        post.video_url = data.get('video_url')
        post.subscribers = [author_key]

        return post

    def isCommonPost(post, data):
        """The post not is sharing or event."""
        return post.shared_event is None and post.shared_post is None and data.get('type_survey') is None

    def createSharing(self, data):
        """Create different type of post, can be shared post or shared event."""
        if data.get('shared_event'):
            self.shared_event = ndb.Key(urlsafe=data["shared_event"])
        elif data.get('shared_post'):
            self.shared_post = ndb.Key(urlsafe=data["shared_post"])

        return self

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
            'video_url': post.video_url,
            'uploaded_images': post.uploaded_images,
            'state': post.state,
            'comments': getCommentsUri(post, host),
            'number_of_comments': post.get_number_of_comment(),
            'publication_date': publication_date,
            'last_modified_date': last_modified_date,
            'author_key': author.key.urlsafe(),
            'last_modified_by': last_modified_by.name,
            'institution_key': institution.key.urlsafe(),
            'institution_state': institution.state,
            'key': post.key.urlsafe(),
            'pdf_files': post.pdf_files if post.pdf_files else [],
            'subscribers': [subscriber.urlsafe() for subscriber in post.subscribers]
        }
        return post.modify_post(post_dict, host)

    def make_comments(post):
        for comment in post.comments.values():
            post.loadAuthor(comment)
            for reply in comment['replies'].values():
                post.loadAuthor(reply)
            
    def loadAuthor(self, entity):
        author = ndb.Key(urlsafe=entity["author_key"]).get()
        entity["author_name"] = author.name
        entity["author_img"] = author.photo_url

    def modify_post(post, post_dict, host):
        """Create personalized json if post was deleted or shared."""
        if(post.state == 'deleted'):
            post_dict['title'] = None
            post_dict['text'] = None

        if(post.shared_post):
            post = post.shared_post.get()
            post_dict['shared_post'] = post.make(host)

        if(post.shared_event):
            post_dict['shared_event'] = Event.make(post.shared_event.get())

        return post_dict

    def get_comment(self, comment_id):
        """Get a comment by id."""
        return self.comments.get(comment_id)

    def get_number_of_comment(self):
        """Get number of comments."""
        return len(self.comments)

    @ndb.transactional(retries=10)
    def add_comment(self, comment):
        """Add a comment to the post."""
        post = self.key.get()
        post.comments[comment.id] = Utils.toJson(comment)
        post.put()

    def remove_comment(self, comment):
        """Remove a commet from post."""
        del self.comments[comment.get('id')]
        self.put()

    @ndb.transactional(retries=10)
    def reply_comment(self, reply, comment_id):
        comment = self.get_comment(comment_id)
        Utils._assert(
            not comment, "This comment has been deleted.", EntityException)
        replies = comment.get('replies')
        replies[reply.id] = Utils.toJson(reply)
        self.put()

    def get_like(self, author_key):
        """Get a like by author key."""
        for like in self.likes:
            if like.author == author_key:
                return like

    def get_number_of_likes(self):
        """Get the number of likes in this post."""
        return len(self.likes)

    @ndb.transactional(retries=10)
    def like_comment(self, user, comment_id=None, reply_id=None):
        """Increment one 'like' in  comment or reply.""" 
        post = self.key.get()
        comment = post.get_comment(comment_id)
        if reply_id:
            comment = comment.get('replies').get(reply_id)

        Utils._assert(comment is None,
                    "This comment has been deleted.", NotAuthorizedException)
        likes = comment.get('likes')
        
        Utils._assert(user.key.urlsafe() in likes,
                    "User already liked this comment", NotAuthorizedException)
        likes.append(user.key.urlsafe())
        post.put()
        return comment

    @ndb.transactional(retries=10, xg=True)
    def like(self, author_key):
        """Increment one 'like' in post."""         
        post = self.key.get()
        user =  author_key.get()
        Utils._assert(post.key in user.liked_posts, 
            "User already liked this publication", NotAuthorizedException)
        if post.get_like(author_key) is None:
            like = Like()
            like.author = author_key
            like.id = Utils.getHash(like)
            post.likes.append(like)
            post.put()
            user.like_post(post.key)
        return post
    
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
        self.put()

    def has_activity(self):
        """Check if the post has comments or likes."""
        has_comments = len(self.comments) > 0
        has_likes = len(self.likes) > 0
        return has_comments or has_likes

    def add_subscriber(self, user):
        """Add a subscriber."""
        if user.state == 'active':
            self.subscribers.append(user.key)

    def remove_subscriber(self, user):
        """Remove a subscriber."""
        if user.key in self.subscribers and self.author != user.key:
            self.subscribers.remove(user.key)

    def create_notification_message(self, user_key, current_institution_key, sender_institution_key=None):
        """ Create message that will be used in notification.
            user_key -- The user key that made the action.
            current_institution_key -- The institution that user was in the moment that made the action.
            sender_institution_key -- The institution by which the post was created,
                if it hasn't been defined yet, the sender institution should be the current institution. 
        """
        return create_message(
            sender_key= user_key,
            current_institution_key=current_institution_key,
            sender_institution_key=sender_institution_key or current_institution_key
        )


    @staticmethod
    def is_hidden(post):
        """Check if the post is deleted and has no activity."""
        has_no_comments = post.get('number_of_comments') == 0
        has_no_likes = post.get('number_of_likes') == 0
        is_deleted = post.get('state') == 'deleted'
        return is_deleted and has_no_comments and has_no_likes
