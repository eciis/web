# -*- coding: utf-8 -*-
"""Institution Collection Handler."""
import json

from utils import Utils
from utils import offset_pagination
from utils import to_int
from util import login_required
from utils import json_response
from custom_exceptions import QueryException

from models import Institution

from . import BaseHandler

__all__ = ['InstitutionCollectionHandler']

class InstitutionCollectionHandler(BaseHandler):
    """Institution Collection Handler."""

    @json_response
    @login_required
    def get(self, user):
        """Get all institutions."""
        INSTITUTION_ATTRIBUTES = ['name', 'key', 'acronym', 'address', 'photo_url', 
            'description', 'admin', 'cover_photo', 'institutional_email', 'creation_date']
        ACTIVE_STATE = "active"
        
        filter_flag = self.request.get('filter')

        map_filter_expression = {
            "following": Institution.key.IN(user.follows),
            "member": Institution.key.IN(user.institutions)
        }

        page = to_int(
            self.request.get('page', Utils.DEFAULT_PAGINATION_OFFSET),
            QueryException,
            "Query param page must be an integer")
        limit = to_int(
            self.request.get('limit', Utils.DEFAULT_PAGINATION_LIMIT),
            QueryException,
            "Query param limit must be an integer")
        
        filter_expression = map_filter_expression.get(filter_flag)

        if filter_expression:
            queryInstitutions = Institution.query(Institution.state == ACTIVE_STATE and filter_expression).order(-Institution.creation_date).order(
                Institution.key)
        else :
            queryInstitutions = Institution.query(
                Institution.state == ACTIVE_STATE).order(-Institution.creation_date)

        queryInstitutions, more = offset_pagination(
            page,
            limit,
            queryInstitutions)

        array = [institution.make(INSTITUTION_ATTRIBUTES) 
        for institution in queryInstitutions]

        data = {
            'institutions': array,
            'next': more
        }

        self.response.write(json.dumps(data))
