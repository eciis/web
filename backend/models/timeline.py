"""Timeline Model."""
from google.appengine.ext import ndb


class Timeline(ndb.Model):
    """Model of Timeline."""

    # TODO: In the future think about maximum size of the entity
    # The data of the posts
    # The only required data is the Post Key/id
    # Ordered by the datetime (most recent first)
    posts = ndb.JsonProperty(repeated=True, compressed=True)