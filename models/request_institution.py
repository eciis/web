# -*- coding: utf-8 -*-
"""Request institution Model."""

from invite import Invite
from request import Request
from google.appengine.ext import ndb


class RequestInstitution(Request):
    """Request Institution Model."""

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
        requested_email = self.admin_key.get().email

        # TODO Set this message
        body = body or """Olá
        Sua instituição recebeu um novo pedido. Acesse:
        http://%s/app/#/requests/%s/institution_children para analisar o mesmo.

        Equipe e-CIS """ % (host, request_key)
        super(RequestInstitution, self).send_email(host, requested_email, body)

    def send_notification(self, user):
        """Method of send notification of invite user."""
        entity_type = 'REQUEST_INSTITUTION'
        super(RequestInstitution, self).send_notification(user, entity_type)

    def make(self):
        """Create json of request to institution children."""
        request_inst_children_json = super(RequestInstitution, self).make()
        request_inst_children_json['type_of_invite'] = 'REQUEST_INSTITUTION'
        return request_inst_children_json
