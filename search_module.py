# -*- coding: utf-8 -*-
"""Search Module."""

from google.appengine.api import search

INDEX_NAME = 'institution'

"""This method receives an id, which is the key.urlsafe() of the institution,
    a name, which is the institution's name, a state, that represents the
    current institution's state, and an admin that is the email of the
    institution's admin, if it is an active one, or the email that the
    invitation was sent to."""


def createDocument(id, name, state, admin):
    """Create a document."""
    content = {'id': id, 'name': name, 'state': state, 'admin': admin}
    # Make the structure of the document by setting the fields and its id.
    document = search.Document(
        # The document's id is the same of the institution's one, what makes the search easier.
        doc_id=content['id'],
        fields=[
            search.TextField(name='name', value=content['name']),
            search.TextField(name='state', value=content['state']),
            search.TextField(name='admin', value=content['admin'])
        ]
    )
    saveDocument(document)


def saveDocument(document):
    """Save Document."""
    index = search.Index(name=INDEX_NAME)
    index.put(document)


def processDocuments(documents):
    """Process the documents."""
    institutions = [doc.fields for doc in documents]
    doc_ids = [doc.doc_id for doc in documents]
    documents_index = 0
    result = []
    inst_fields = {}
    for institution in institutions:
        for field in institution:
            inst_fields[field.name] = field.value
        inst_fields['id'] = doc_ids[documents_index]
        result.append(inst_fields)
        documents_index = documents_index + 1
        inst_fields = {}
    return result


def getDocuments(institution, state):
    """Retrieve the documents and return them processed."""
    query_string = makeQueryStr(institution, state)
    index = search.Index(INDEX_NAME)
    query_options = search.QueryOptions(
        returned_fields=['name', 'state', 'admin']
    )
    query = search.Query(query_string=query_string, options=query_options)
    documents = index.search(query)
    return processDocuments(documents)


def makeQueryStr(institution, state):
    """Make the query string."""
    states = state.split(",")
    state_string = ""
    for i in xrange(0, len(states), 1):
        if(i == 0):
            state_string += states[i]
        else:
            state_string += " OR " + states[i]
    return "name: %s AND state: %s" % (institution, state_string)
