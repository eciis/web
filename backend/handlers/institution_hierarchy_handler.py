# -*- coding: utf-8 -*-
"""Institution Hierarchy Handler."""

from google.appengine.ext import ndb

from utils import Utils
from util.login_service import login_required
from utils import json_response
from custom_exceptions.notAuthorizedException import NotAuthorizedException
from custom_exceptions.entityException import EntityException

from models import Institution

from service_messages import send_message_notification
from service_entities import enqueue_task
import json

from . import BaseHandler

__all__ = ['InstitutionHierarchyHandler']

class InstitutionHierarchyHandler(BaseHandler):
    """Institution Hierarchy Handler."""

    @json_response
    @login_required
    @ndb.transactional(xg=True)
    def delete(self, user, institution_key, institution_link):
        """
        Handle delete link between institutions.

        This handler remove the link between two institutions. 
        If the parameter isParent is true, it means that the removal 
        request has been made from a child institution, otherwise 
        the request has been made by a parent institution.
        """

        user.check_permission('remove_link',
                              "User is not allowed to remove link between institutions",
                              institution_key)

        is_parent = self.request.get('isParent')
        # If isParent is true, this attribute 
        # holds the reference of the child intitution.
        institution = ndb.Key(urlsafe=institution_key).get()
        # If isParent is true, this attribute 
        # holds the reference of the parent intitution.
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

        if is_parent == "true":
            enqueue_task('remove-admin-permissions', {
                         'institution_key': institution.key.urlsafe(), 'parent_key': institution_link.key.urlsafe()})
        else:
            enqueue_task('remove-admin-permissions', {'institution_key': institution_link.key.urlsafe(), 'parent_key': institution.key.urlsafe()})
        
        notification_type = 'REMOVE_INSTITUTION_LINK'

        notification_message = institution.create_notification_message(user_key=user.key, current_institution_key=user.current_institution, 
            receiver_institution_key=institution_link.key, sender_institution_key=institution.key)
        send_message_notification(
            receiver_key=admin.urlsafe(),
            notification_type=notification_type,
            entity_key=institution_link.key.urlsafe(),
            message=notification_message
        )
