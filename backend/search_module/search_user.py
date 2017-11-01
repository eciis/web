# -*- coding: utf-8 -*-
"""Search User."""

from google.appengine import api
from search_document import SearchDocument


class SearchUser(SearchDocument):
    """Search user's model."""

    def __init__(self):
        """Init method."""
        self.index_name = 'user'

    def createDocument(self, user):
        """Create a document.

        Keyword arguments:
        id -- the key.urlsafe() of the user
        name -- the user's name
        state -- represents the current user's state
        """
        content = {
            'id': user.key.urlsafe(),
            'name': user.name,
            'state': user.state,
        }
        # Make the structure of the document by setting the fields and its id.
        document = api.search.Document(
            # The document's id is the same of the user's one,
            # what makes the search easier.
            doc_id=content['id'],
            fields=[
                api.search.TextField(name='name', value=content['name']),
                api.search.TextField(name='state', value=content['state']),
            ]
        )
        self.saveDocument(document)

    def getDocuments(self, value, state):
        """Retrieve the documents and return them processed."""
        query_string = self.makeQueryStr(value, state)
        index = api.search.Index(name=self.index_name)
        query_options = api.search.QueryOptions(
            returned_fields=['name', 'state']
        )
        query = api.search.Query(query_string=query_string, options=query_options)
        documents = index.search(query)
        return self.processDocuments(documents)

    def makeQueryStr(self, value, state):
        """Make the query string.

        Keyword arguments:
        value -- value to be searched
        state -- represents the current institution's state.
        """
        states = state.split(",")
        state_string = ""
        for i in xrange(0, len(states), 1):
            if(i == 0):
                state_string += states[i]
            else:
                state_string += " OR " + states[i]
        return "name: %s AND state: %s" % (value, state_string)
