# -*- coding: utf-8 -*-
"""Search Module."""

from google.appengine.api import search

INDEX_NAME = 'institution'


def createDocument(institution):
    """Create a document.

    Keyword arguments:
    id -- the key.urlsafe() of the institution
    name -- the institution's name
    state -- represents the current institution's state
    admin -- the email of the institution's admin,
    acronym -- the institution's name acronym
    if it is an active one, or the email that the invitation was sent to.
    """
    admin = institution.email
    if institution.admin:
        admin = institution.admin.get().email[0]

    content = {
        'id': institution.key.urlsafe(),
        'name': institution.name,
        'state': institution.state,
        'admin': admin,
        'acronym': institution.acronym
    }
    # Make the structure of the document by setting the fields and its id.
    document = search.Document(
        # The document's id is the same of the institution's one,
        # what makes the search easier.
        doc_id=content['id'],
        fields=[
            search.TextField(name='name', value=content['name']),
            search.TextField(name='state', value=content['state']),
            search.TextField(name='admin', value=content['admin']),
            search.TextField(name='acronym', value=content['acronym'])
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


def getDocuments(value, state):
    """Retrieve the documents and return them processed."""
    query_string = makeQueryStr(value, state)
    index = search.Index(INDEX_NAME)
    query_options = search.QueryOptions(
        returned_fields=['name', 'state', 'admin', 'acronym']
    )
    query = search.Query(query_string=query_string, options=query_options)
    documents = index.search(query)
    return processDocuments(documents)


def updateDocument(institution):
    """Update a Document.

    When an institution changes its name or acronym, this function
    updates the previous document.
    """
    index = search.Index(INDEX_NAME)
    index.delete(institution.key.urlsafe())
    createDocument(institution)


def makeQueryStr(value, state):
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
    return "(name: %s OR acronym: %s) AND state: %s" % (value, value, state_string)


def deleteDocument(doc_id):
    """Delete a document."""
    index = search.Index(INDEX_NAME)
    index.delete(doc_id)
