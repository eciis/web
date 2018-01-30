# -*- coding: utf-8 -*-
"""Request institution parent link model."""

from invite import Invite
from request import Request
from google.appengine.ext import ndb


class RequestInstitutionParent(Request):
    """Model of request parent institution."""

    @staticmethod
    def create(data):
        """Create a request and check required fields."""
        request = RequestInstitutionParent()
        request.sender_key = ndb.Key(urlsafe=data.get('sender_key'))
        request.institution_requested_key = ndb.Key(urlsafe=data.get('institution_requested_key'))
        request = Invite.create(data, request)
        request.isValid()
        return request

    def send_email(self, host, body=None):
        """Method of send email of request institution link."""
        request_key = self.key.urlsafe()
        requested_email = self.admin_key.get().email[0]

        # TODO Set this message
        body = body or """Olá
        Sua instituição recebeu um novo pedido. Acesse:
        http://%s/requests/%s/institution_parent para analisar o mesmo.

        Equipe da Plataforma CIS """ % (host, request_key)
        super(RequestInstitutionParent, self).send_email(host, requested_email, body)

    def send_notification(self, user):
        """Method of send notification of invite user."""
        entity_type = 'REQUEST_INSTITUTION_PARENT'
        super(RequestInstitutionParent, self).send_notification(user, self.institution_requested_key.get().admin.urlsafe(), entity_type)

    def send_response_notification(self, user, receiver_key, entity_type):
        """Send notification to sender of invite when invite is accepted or rejected."""
        super(RequestInstitutionParent, self).send_notification(user, receiver_key, entity_type)

    def make(self):
        """Create json of request to parent institution."""
        request_inst_parent_json = super(RequestInstitutionParent, self).make()
        request_inst_parent_json['institution_requested_key'] = self.institution_requested_key.urlsafe()
        request_inst_parent_json['type_of_invite'] = 'REQUEST_INSTITUTION_PARENT'
        return request_inst_parent_json
