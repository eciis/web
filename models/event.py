"""Event Model."""
from google.appengine.ext import ndb
import datetime
from custom_exceptions.fieldException import FieldException

class Event(ndb.Model):
    """Model of a event."""

    # Title of the event
    title = ndb.StringProperty(required=True)

    # Image uploaded
    photo_url = ndb.StringProperty(indexed=False)

    # Text about the event
    text = ndb.TextProperty()

    # User who is the author of the event
    author_key = ndb.KeyProperty(kind="User", required=True)

    # URL photo of author
    author_photo = ndb.StringProperty(required=True)

    # Name of Author
    author_name = ndb.StringProperty(required=True)

    # Institution to which this event belongs
    institution_key = ndb.KeyProperty(kind="Institution", required=True)

    # URL photo of institution
    institution_photo = ndb.StringProperty(required=True)

    # Name of Institution
    institution_name = ndb.StringProperty(required=True)

    state = ndb.StringProperty(choices=set([
        'draft',
        'published',
        'deleted'
    ]), default='published')

    # Date and time of a initial time of a event
    start_time = ndb.DateTimeProperty(required=True)

    # Date and time of a end time of a event
    end_time = ndb.DateTimeProperty(required=True)

    # Local of the event
    local = ndb.StringProperty(required=True)

    def isValid(self):
        if self.end_time < self.start_time:
            raise FieldException("The end time can not be before the start time")

    @staticmethod
    def create(data, author_key, author_name, author_photo,
               institution_key, institution_name, institution_photo):
        """Create an event."""

        event = Event()
        event.text = data.get('text')
        event.title = data.get('title')
        event.photo_url = data.get('photo_url')
        event.author_key = author_key
        event.author_photo = author_photo
        event.author_name = author_name
        event.institution_key = institution_key
        event.institution_name = institution_name
        event.institution_photo = institution_photo
        event.local = data.get('local')
        event.start_time = datetime.datetime.strptime(
            data.get('start_time'), "%Y-%m-%dT%H:%M:%S")
        event.end_time = datetime.datetime.strptime(
            data.get('end_time'), "%Y-%m-%dT%H:%M:%S")

        event.isValid()

        return event

    @staticmethod
    def make(event):
        """Create personalized json of event."""
        start_time = event.start_time.isoformat()
        end_time = event.end_time.isoformat()
        return {
            'title': event.title,
            'text': event.text,
            'local': event.local,
            'start_time': start_time,
            'end_time': end_time,
            'state': event.state,
            'author': event.author_name,
            'author_img': event.author_photo,
            'institution_name': event.institution_name,
            'institution_image': event.institution_photo,
            'photo_url': event.photo_url,
            'author_key': event.author_key.urlsafe(),
            'institution_key': event.institution_key.urlsafe(),
            'key': event.key.urlsafe()
        }
