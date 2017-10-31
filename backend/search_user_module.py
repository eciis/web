# -*- coding: utf-8 -*-
"""Search User Module."""

from google.appengine.api import search

INDEX_NAME = 'user'


def createUserDocument(user):
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
    document = search.Document(
        # The document's id is the same of the user's one,
        # what makes the search easier.
        doc_id=content['id'],
        fields=[
            search.TextField(name='name', value=content['name']),
            search.TextField(name='state', value=content['state']),
        ]
    )
    saveUserDocument(document)


def saveUserDocument(document):
    """Save Document."""
    index = search.Index(name=INDEX_NAME)
    index.put(document)


def processUserDocuments(documents):
    """Process the documents."""
    users = [doc.fields for doc in documents]
    doc_ids = [doc.doc_id for doc in documents]
    documents_index = 0
    result = []
    user_fields = {}
    for user in users:
        for field in user:
            user_fields[field.name] = field.value
        user_fields['id'] = doc_ids[documents_index]
        result.append(user_fields)
        documents_index = documents_index + 1
        user_fields = {}
    return result


def getUserDocuments(value, state):
    """Retrieve the documents and return them processed."""
    query_string = makeUserQueryStr(value, state)
    index = search.Index(INDEX_NAME)
    query_options = search.QueryOptions(
        returned_fields=['name', 'state']
    )
    query = search.Query(query_string=query_string, options=query_options)
    documents = index.search(query)
    return processUserDocuments(documents)


def updateUserDocument(user):
    """Update a Document.

    When an user changes its name, this function
    updates the previous document.
    """
    index = search.Index(INDEX_NAME)
    index.delete(user.key.urlsafe())
    createUserDocument(user)


def makeUserQueryStr(value, state):
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


def deleteUserDocument(doc_id):
    """Delete a document."""
    index = search.Index(INDEX_NAME)
    index.delete(doc_id)
