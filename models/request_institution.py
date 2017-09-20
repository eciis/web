# -*- coding: utf-8 -*-
"""Request institution Model."""

from invite import Invite
from request import Request
from google.appengine.ext import ndb
from utils import getSuperUsers
from custom_exceptions.fieldException import FieldException


class RequestInstitution(Request):
    """Request Institution Model."""

    def isValid(self):
        institution_key = self.institution_key
        sender = self.sender_key
        if not sender:
            raise FieldException("The request require sender_key")
        if Request.isRequested(sender, institution_key):
            raise FieldException("The sender is already invited")

    @staticmethod
    def create(data):
        """Create a post and check required fields."""
        request = RequestInstitution()
        request.sender_key = ndb.Key(urlsafe=data.get('sender_key'))
        request = Invite.create(data, request)
        request.isValid()
        return request

    def send_email(self, host, body=None):
        """Method of send email of request institution link."""
        request_key = self.key.urlsafe()

        # TODO Set this message
        body = body or """Olá
        Sua instituição recebeu um novo pedido. Acesse:
        http://%s/app/#/requests/%s/institution_children para analisar o mesmo.

        Equipe e-CIS """ % (host, request_key)

        super_users = getSuperUsers()

        for super_user in super_users:
            super(RequestInstitution, self).send_email(host, super_user, body)

    def send_notification(self, user):
        """Method of send notification of request intitution."""
        entity_type = 'REQUEST_INSTITUTION'

        super_users = getSuperUsers()

        for super_user in super_users:
            super(RequestInstitution, self).send_notification(super_user, entity_type)

    def make(self):
        """Create json of request to institution."""
        request_inst_json = super(RequestInstitution, self).make()
        request_inst_json['type_of_invite'] = 'REQUEST_INSTITUTION'
        return request_inst_json
