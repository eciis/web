# -*- coding: utf-8 -*-
"""Institution Hierarchy Handler."""

from google.appengine.ext import ndb

from utils import Utils
from utils import login_required
from utils import json_response
from custom_exceptions.notAuthorizedException import NotAuthorizedException
from custom_exceptions.entityException import EntityException

from models.institution import Institution

from service_messages import send_message_notification
import json

from handlers.base_handler import BaseHandler
from handlers.institution_handler import is_admin


class InstitutionHierarchyHandler(BaseHandler):
    """Institution Hierarchy Handler."""

    @json_response
    @login_required
    @is_admin
    @ndb.transactional(xg=True)
    def delete(self, user, institution_key, institution_link):
        """Handle delete requests."""
        is_parent = self.request.get('isParent')
        institution = ndb.Key(urlsafe=institution_key).get()
        institution_link = ndb.Key(urlsafe=institution_link).get()

        Utils._assert(not type(institution) is Institution,
                      "Key is not an institution", EntityException)
        Utils._assert(not type(institution_link) is Institution,
                      "Key is not an institution", EntityException)
        Utils._assert(institution.state == 'inactive',
                      "The institution has been deleted", NotAuthorizedException)
        Utils._assert(institution_link.state == 'inactive',
                      "The institution has been deleted", NotAuthorizedException)

        institution.remove_link(institution_link, is_parent)
        admin = institution_link.admin
        entity_type = 'INSTITUTION'
        message = {'type': 'INSTITUTION', 'from': user.name.encode('utf8')}
        send_message_notification(
            admin.urlsafe(),
            json.dumps(message),
            entity_type,
            institution_link.key.urlsafe())
