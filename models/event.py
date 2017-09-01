"""Event Model."""
from google.appengine.ext import ndb
import datetime
from custom_exceptions.fieldException import FieldException

class Event(ndb.Model):
    """Model of a event."""

    # Title of the event
    title = ndb.StringProperty(required=True)

    # Image uploaded
    photo_url = ndb.StringProperty()

    # Text about the event
    text = ndb.TextProperty()

    # User who is the author of the event
    author_key = ndb.KeyProperty(kind="User", required=True)

    # Institution to which this event belongs
    institution_key = ndb.KeyProperty(kind="Institution", required=True)

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

    @staticmethod
    def create(data, author_key, institution_key):
        """Create an event."""
        today = datetime.datetime.now()
        start_time = datetime.datetime.strptime(data['start_time'], "%Y%m%d%H%M%S")
        end_time = datetime.datetime.strptime(data['end_time'], "%Y%m%d%H%M%S")

        if end_time < start_time:
            raise FieldException("The end time can not be before the start time")
        if start_time < today:
            raise FieldException("The start time can not be before now")

        event = Event()
        event.text = data['text']
        event.title = data['title']
        event.photo_url = data.get('photo_url')
        event.author_key = author_key
        event.institution_key = institution_key
        event.local = data['local']
        event.start_time = datetime.datetime.strptime(data['start_time'], "%Y%m%d%H%M%S")
        event.end_time = datetime.datetime.strptime(data['end_time'], "%Y%m%d%H%M%S")

        return event

    @staticmethod
    def make(event):
        """Create personalized json of comment."""
        author = event.author_key.get()
        institution = event.institution_key.get()
        return {
            'text': event.text,
            'title': event.title,
            'photo_url': event.photo_url,
            'author': event.author_key.urlsafe(),
            'author_name': author.name,
            'institution_name': institution.name,
            'institution_name': institution.name,
            'local': author.photo_url,
            'start_time': event.start_time.isoformat(),
            'end_time': event.end_time.isoformat(),
            'key': event.key.urlsafe()
        }
