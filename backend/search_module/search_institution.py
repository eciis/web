# -*- coding: utf-8 -*-
"""Search Institution."""

from google.appengine.api import search
from search_document import SearchDocument
from models import Address


def institution_has_changes(fields, entity):
        """It returns True when there is a change
        to make in entity's document.
        """
        address = entity.address

        for field in fields:
            if hasattr(entity, field.name) and field.value != getattr(entity, field.name):
                return True
            elif hasattr(address, field.name) and field.value != getattr(address, field.name):
                return True

        return False


class SearchInstitution(SearchDocument):
    """Search institution's model."""

    def __init__(self):
        """Init method."""
        self.index_name = 'institution'

    def createDocument(self, institution):
        """Create a document.

        Keyword arguments:
        institution -- It wrapps the attributes that will be used in document.
        All of them are self descriptive and
        relationed to the institution.
        """
        index = search.Index(name=self.index_name)
        doc = index.get(institution.key.urlsafe())
        if doc is None or doc is type(None):
            admin = institution.email
            if institution.admin:
                admin = institution.admin.get().email[0]

            content = {
                'id': institution.key.urlsafe(),
                'name': institution.name,
                'email': institution.email,
                'state': institution.state,
                'admin': admin,
                'acronym': institution.acronym,
                'actuation_area': institution.actuation_area,
                'legal_nature': institution.legal_nature,
                'federal_state': institution.address and institution.address.federal_state,
                'description': institution.description
            }
            # Make the structure of the document by setting the fields and its id.
            document = search.Document(
                # The document's id is the same of the institution's one,
                # what makes the search easier.
                doc_id=content['id'],
                fields=[
                    search.TextField(name='name', value=content['name']),
                    search.TextField(name='email', value=content['email']),
                    search.TextField(name='state', value=content['state']),
                    search.TextField(name='admin', value=content['admin']),
                    search.TextField(name='acronym', value=content['acronym']),
                    search.TextField(name='actuation_area',
                                         value=content['actuation_area']),
                    search.TextField(name='legal_nature',
                                         value=content['legal_nature']),
                    search.TextField(name='federal_state', value=content['federal_state']),
                    search.TextField(name='description', value=content['description'])
                ]
            )
            self.saveDocument(document)
        else:
            self.updateDocument(institution)

    def getDocuments(self, value, state):
        """Retrieve the documents and return them processed."""
        query_string = self.makeQueryStr(value, state)
        index = search.Index(self.index_name)
        query_options = search.QueryOptions(
            returned_fields=['name', 'state', 'email', 'admin', 'acronym',
                             'actuation_area', 'legal_nature', 'federal_state', 'description']
        )
        query = search.Query(
            query_string=query_string, options=query_options)
        documents = index.search(query)
        return self.processDocuments(documents)

    def makeQueryStr(self, value, state):
        """Make the query string.

        Keyword arguments:
        value -- value to be searched
        state -- represents the current institution's state.
        """
        state_string = self.create_state_string(state)
        fields_values_string = self.create_field_values_string(value)

        query_string = "(%s) AND %s" % (fields_values_string, state_string) if fields_values_string else state_string
        return query_string

    def create_state_string(self, state):
        """Create a string formed by state."""
        states = state.split(",")
        state_string = ""
        for i in xrange(0, len(states), 1):
            if(i == 0):
                state_string += states[i]
            else:
                state_string += " OR " + states[i]

        state_string = "state: %s" % state_string
        return state_string

    def create_field_values_string(self, value):
        """Create a string formed by fields and values.
        
        If value is empty the method will return an empty string
        which means that the query will be only by the state
        and the fields won't be considered.
        """
        # add a new field here
        fields = ['name', 'acronym', 'actuation_area', 'legal_nature', 'federal_state', 'description']
        fields_values = []

        if value:
            for field in fields:
                field_value = '%s: "%s"' % (field, value)
                fields_values.append(field_value)

        fields_values_string = " OR ".join(fields_values) if fields_values else ""

        return fields_values_string
    
    def updateDocument(self, entity, has_changes=institution_has_changes):
        """Update a Document.

        When an entity changes its fields, this function
        updates the previous document.
        """
        super(SearchInstitution, self).updateDocument(entity, has_changes)
