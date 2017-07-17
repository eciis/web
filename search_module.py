# -*- coding: utf-8 -*-
"""Search Module."""

from google.appengine.api import search

INDEX_NAME = 'institution'


def createDocument(id, name, state):
    """Create a document."""
    content = {'id': str(id), 'name': name, 'state': state}
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
    names = []
    for fields in institutions:
        for each in fields:
            names.append(each.value.encode('utf-8'))
    return names
