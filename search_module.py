# -*- coding: utf-8 -*-
"""Search Module."""

from google.appengine.api import search

INDEX_NAME = 'institution'


def createDocument(id, name, state, admin):
    """Create a document."""
    content = {'id': id, 'name': name, 'state': state, 'admin': admin}
    document = search.Document(
        doc_id=content['id'],
        fields=[
            search.TextField(name='institution', value=content['name']),
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
            if(field.name == 'institution'):
                inst_fields['name'] = field.value
            elif(field.name == 'state'):
                inst_fields['state'] = field.value
            else:
                inst_fields['admin'] = field.value
        inst_fields['id'] = doc_ids[documents_index]
        result.append(inst_fields)
        documents_index = documents_index + 1
        inst_fields = {}
    return result


def getDocuments(institution, state):
    """Retrieve the documents and return them processed."""
    query_string = "institution: %s AND state: %s" % (institution, state)
    index = search.Index(INDEX_NAME)
    query_options = search.QueryOptions(
        returned_fields=['institution', 'state', 'admin']
    )
    query = search.Query(query_string=query_string, options=query_options)
    documents = index.search(query)
    return processDocuments(documents)
