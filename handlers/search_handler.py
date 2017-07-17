# -*- coding: utf-8 -*-
"""Search Handler."""

from utils import login_required
from utils import json_response
from google.appengine.api import search

from handlers.base_handler import BaseHandler

INDEX_NAME = 'institution'


class SearchHandler(BaseHandler):
    """Search Handler."""

    @json_response
    @login_required
    def get(self, user, query_string):
        """Handle GET Requests."""
        index = search.Index(INDEX_NAME)
        query_options = search.QueryOptions(
            returned_fields=['institution']
        )
        query = search.Query(query_string=query_string, options=query_options)
        results = index.search(query)
        self.response.write(
            processDocuments(results)
        )


def CreateDocument(content):
    """Create a document."""
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
