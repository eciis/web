# -*- coding: utf-8 -*-
"""Request Model."""
from models.invite import Invite
from custom_exceptions.fieldException import FieldException


class Request(Invite):
    """Model of Request."""

    @staticmethod
    def isLinked(institution_key, institution_requested):
        isParent = institution_key == institution_requested.parent_institution
        isChildren = institution_key in institution_requested.children_institutions

        return isParent or isChildren

    @staticmethod
    def isRequested(sender, institution_requested_key):
        request = Request.query(
            Request.institution_key == institution_requested_key,
            Request.status == 'sent',
            Request.sender_key == sender)

        return request.count() > 0

    @staticmethod
    def checkHasParent(institution_requested):
        if institution_requested.parent_institution is not None:
            raise FieldException("The institution invited has already parent")

    def isValid(self):
        institution_key = self.institution_key
        sender = self.sender_key
        institution_requested = self.institution_requested_key.get()
        if not sender:
            raise FieldException("The request require sender_key")
        if not institution_requested:
            raise FieldException("The request require institution_requested")
        if Request.isLinked(institution_key, institution_requested):
            raise FieldException("The institutions is already a linked")
        if Request.isRequested(sender, institution_key):
            raise FieldException("The sender is already invited")
        if (self.__class__.__name__ == 'RequestInstitutionChildren'):
            Request.checkHasParent(institution_requested)

    def make(self):
        """Create json of request to institution."""
        request_inst_json = super(Request, self).make()
        request_inst_json['sender'] = self.sender_key.get().email
        request_inst_json['status'] = self.status
        request_inst_json['institution_key'] = self.institution_key.urlsafe()

        return request_inst_json
