# -*- coding: utf-8 -*-
"""Search Event."""

from google.appengine.api import search
from . import SearchDocument
from utils import text_normalize
import json
from datetime import timedelta

__all__ = ['SearchEvent']

def event_has_changes(fields, entity):
        """It returns True when there is a change
        to make in entity's document.
        """
        address = entity.address

        for field in fields:
            if hasattr(entity, field.name) and field.value != getattr(entity, field.name):
                return True
            elif hasattr(address, field.name) and field.value != getattr(address, field.name):
                return True

        return False

def get_date_string(event_date):
    """It fix the utc for Brazil and returns only the date."""
    return (event_date - timedelta(hours=3)).isoformat().split("T")[0]

class SearchEvent(SearchDocument):
    """Search event's model."""

    def __init__(self):
        """Init method."""
        self.index_name = 'event'

    def createDocument(self, event):
        """Create a document.

        Keyword arguments:
        event -- It wrapps the attributes that will be used in document.
        All of them are self descriptive and
        relationed to the event.
        """
        index = search.Index(name=self.index_name)
        doc = index.get(event.key.urlsafe())
        if doc is None or doc is type(None):

            content = {
                'id': event.key.urlsafe(),
                'state': event.state,
                'title': event.title,
                'institution_name': event.institution_name,
                'institution_key': event.institution_key.urlsafe(),
                'photo_url': event.photo_url,
                'institution_acronym': event.institution_acronym,
                'start_time': event.start_time.isoformat(),
                'date': get_date_string(event.start_time),
                'address': event.address and json.dumps(dict(event.address)),
                'country': event.address and event.address.country,
                'federal_state': event.address and event.address.federal_state,
                'city': event.address and event.address.city
            }

            # Make the structure of the document by setting the fields and its id.
            document = search.Document(
                # The document's id is the same of the event's one,
                # what makes the search easier.
                doc_id=content['id'],
                fields=[
                    search.TextField(name='state', value=content['state']),
                    search.TextField(name='title', value=content['title']),
                    search.TextField(name='institution_name', value=content['institution_name']),
                    search.TextField(name='institution_key', value=content['institution_key']),
                    search.TextField(name='photo_url', value=content['photo_url']),
                    search.TextField(name='institution_acronym', value=content['institution_acronym']),
                    search.TextField(name='start_time', value=content['start_time']),
                    search.TextField(name='date', value=content['date']),
                    search.TextField(name='address', value=content['address']),
                    search.TextField(name='country', value=content['country']),
                    search.TextField(name='federal_state', value=content['federal_state']),
                    search.TextField(name='city', value=content['city'])
                ]
            )
            self.saveDocument(document)
        else:
            self.updateDocument(event)

    def getDocuments(self, value, state):
        """Retrieve the documents and return them processed."""
        query_string = self.makeQueryStr(value, state)
        index = search.Index(self.index_name)
        query_options = search.QueryOptions(
            returned_fields=['state', 'title', 'institution_key', 'photo_url', 'institution_name',
                'institution_acronym', 'start_time', 'address']
        )
        query = search.Query(
            query_string=query_string, options=query_options)
        documents = index.search(query)
        return self.processDocuments(documents)

    def makeQueryStr(self, value, state):
        """Make the query string.

        Keyword arguments:
        value -- value to be searched
        state -- represents the current event's state.
        """
        state_string = self.create_state_string(state)
        fields_values_string = self.create_field_values_string(value)

        query_string = "(%s) AND %s" % (fields_values_string, state_string) if fields_values_string else state_string
        return query_string

    def create_state_string(self, state):
        """Create a string formed by state."""
        states = state.split(",")
        state_string = ""
        for i in xrange(0, len(states), 1):
            if(i == 0):
                state_string += states[i]
            else:
                state_string += " OR " + states[i]

        state_string = "state: %s" % state_string
        return state_string

    def create_field_values_string(self, value):
        """Create a string formed by fields and values.
        
        If value is empty the method will return an empty string
        which means that the query will be only by the state
        and the fields won't be considered.
        """
        # add a new field here
        fields = ['state', 'institution_name', 'date',
                'institution_acronym', 'country', 'federal_state', 'city']
        fields_values = []

        if value:
            for field in fields:
                field_value = '%s: "%s"' % (field, value)
                fields_values.append(field_value)

        fields_values_string = " OR ".join(fields_values) if fields_values else ""
        return text_normalize(fields_values_string)
    
    def updateDocument(self, entity, has_changes=event_has_changes):
        """Update a Document.

        When an entity changes its fields, this function
        updates the previous document.
        """
        super(SearchEvent, self).updateDocument(entity, has_changes)
