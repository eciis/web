# -*- coding: utf-8 -*-
"""Search Module."""

from google.appengine.api import search

INDEX_NAME = 'institution'


def createDocument(id, name, state):
    """Create a document."""
    content = {'id': id, 'name': name, 'state': state}
    document = search.Document(
        doc_id=content['id'],
        fields=[
            search.TextField(name='institution', value=content['name']),
            search.TextField(name='state', value=content['state'])
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
    for institution in institutions:
        for field in institution:
            result.append(
                {"id": doc_ids[documents_index],
                    "name": field.value}
            )
            documents_index = documents_index + 1
    return result


def getDocuments(institution, state):
    """Retrieve the documents and return them processed."""
    query_string = "institution: %s AND %s" % (institution, state)
    index = search.Index(INDEX_NAME)
    query_options = search.QueryOptions(
        returned_fields=['institution']
    )
    query = search.Query(query_string=query_string, options=query_options)
    documents = index.search(query)
    return processDocuments(documents)
