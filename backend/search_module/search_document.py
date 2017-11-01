# -*- coding: utf-8 -*-
"""Search."""

from google.appengine.ext.ndb.polymodel import PolyModel
from google.appengine.api import search


class SearchDocument(PolyModel):
    """Search's model."""

    def deleteDocument(self, doc_id):
        """Delete a document."""
        index = search.Index(name=self.index_name)
        index.delete(doc_id)

    def processDocuments(self, documents):
        """Process the documents."""
        entities = [doc.fields for doc in documents]
        doc_ids = [doc.doc_id for doc in documents]
        documents_index = 0
        result = []
        entity_fields = {}
        for entity in entities:
            for field in entity:
                entity_fields[field.name] = field.value
            entity_fields['id'] = doc_ids[documents_index]
            result.append(entity_fields)
            documents_index = documents_index + 1
            entity_fields = {}
        return result

    def saveDocument(self, document):
        """Save Document."""
        index = search.Index(name=self.index_name)
        index.put(document)

    def updateDocument(self, entity):
        """Update a Document.

        When an entity changes its fields, this function
        updates the previous document.
        """
        index = search.Index(name=self.index_name)
        index.delete(entity.key.urlsafe())
        self.createDocument(entity)
