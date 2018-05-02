# -*- coding: utf-8 -*-
"""Request Model."""
from models.invite import Invite
from custom_exceptions.fieldException import FieldException
from service_messages import create_message


class Request(Invite):
    """Model of Request."""

    @staticmethod
    def isLinked(institution_key, institution_requested):
        institution = institution_key.get()
        
        is_parent_from_top_down_perspective = institution_requested.key in institution.children_institutions
        is_parent_from_bottom_up_perspective = institution_key == institution_requested.parent_institution
        is_parent = is_parent_from_top_down_perspective and is_parent_from_bottom_up_perspective

        is_child_from_bottom_up_perspective = institution.parent_institution == institution_requested.key
        is_child_from_top_down_perspective = institution_key in institution_requested.children_institutions
        is_child = is_child_from_bottom_up_perspective and is_child_from_top_down_perspective

        return is_parent or is_child

    @staticmethod
    def isRequested(sender_inst_key, institution_requested_key):
        request = Request.query(
            Request.institution_requested_key == institution_requested_key,
            Request.institution_key == sender_inst_key,
            Request.status == 'sent')

        return request.count() > 0

    def isValid(self):
        institution_key = self.institution_key
        sender = self.sender_key
        institution_requested = self.institution_requested_key.get()
        if not sender:
            raise FieldException("The request require sender_key")
        if not institution_requested:
            raise FieldException("The request require institution_requested")
        if Request.isLinked(institution_key, institution_requested):
            raise FieldException("The institutions has already been connected.")
        if Request.isRequested(institution_key, institution_requested.key):
            raise FieldException("The sender is already invited")

    def make(self):
        """Create json of request to institution."""
        request_inst_json = super(Request, self).make()
        request_inst_json['sender'] = self.sender_key.get().email
        request_inst_json['status'] = self.status
        request_inst_json['institution_key'] = self.institution_key.urlsafe()
        request_inst_json['sender_key'] = self.sender_key.urlsafe()
        if self.institution_requested_key:
            requested_isntitution = self.institution_requested_key.get()
            request_inst_json['requested_inst_name'] = requested_isntitution.name

        return request_inst_json

    def create_notification_message(self, user_key, current_institution_key=None, 
            sender_institution_key=None, receiver_institution_key=None):
        """ Create message that will be used in notification. 
            user_key -- The user key that made the action.
            current_institution -- The institution that user was in the moment that made the action,
                 in case that user is inactive he didn't have institution.
            sender_institution_key -- The institution that should be made the action,
                 when wasn't specified will be the current_institution.
            receiver_institution -- The institution to which the notification is directed. 
        """
        return create_message(
            sender_key=user_key,
            current_institution_key=current_institution_key,
            sender_institution_key= sender_institution_key or current_institution_key,
            receiver_institution_key=receiver_institution_key,
        )