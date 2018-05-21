# -*- coding: utf-8 -*-
"""Search User."""

from google.appengine.api import search
from . import SearchDocument


class SearchUser(SearchDocument):
    """Search user's model."""

    def __init__(self):
        """Init method."""
        self.index_name = 'user'

    def createDocument(self, user):
        """Create a document.

        Keyword arguments:
        user -- It wrapps the attributes that will be used in document like id,
        name and state. All of them are self descriptive and
        relationed to the user.
        """
        index = search.Index(name=self.index_name)
        doc = index.get(user.key.urlsafe())
        if doc is None or doc is type(None):
            content = {
                'id': user.key.urlsafe(),
                'name': user.name,
                'state': user.state,
            }
            # Make the structure of the document by setting the fields and its id.
            document = search.Document(
                # The document's id is the same of the user's one,
                # what makes the search easier.
                doc_id=content['id'],
                fields=[
                    search.TextField(name='name', value=content['name']),
                    search.TextField(name='state', value=content['state']),
                ]
            )
            self.saveDocument(document)
        else:
            self.updateDocument(user)

    def getDocuments(self, value, state):
        """Retrieve the documents and return them processed."""
        query_string = self.makeQueryStr(value, state)
        index = search.Index(name=self.index_name)
        query_options = search.QueryOptions(
            returned_fields=['name', 'state']
        )
        query = search.Query(query_string=query_string, options=query_options)
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
        return 'name: "%s" AND state: %s' % (value, state_string)
