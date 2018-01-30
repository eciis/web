# -*- coding: utf-8 -*-
"""Request institution link model."""

from invite import Invite
from request import Request
from google.appengine.ext import ndb


class RequestInstitutionChildren(Request):
    """Model of request children institution."""

    @staticmethod
    def create(data):
        """Create a post and check required fields."""
        request = RequestInstitutionChildren()
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
        http://%s/requests/%s/institution_children para analisar o mesmo.

        Equipe da Plataforma CIS """ % (host, request_key)
        super(RequestInstitutionChildren, self).send_email(host, requested_email, body)

    def send_notification(self, user):
        """Method of send notification of invite user."""
        entity_type = 'REQUEST_INSTITUTION_CHILDREN'
        super(RequestInstitutionChildren, self).send_notification(user, self.institution_requested_key.get().admin.urlsafe(), entity_type)

    def send_response_notification(self, user, receiver_key, entity_type):
        """Send notification to sender of invite when invite is accepted or rejected."""
        super(RequestInstitutionChildren, self).send_notification(user, receiver_key, entity_type)

    def make(self):
        """Create json of request to institution children."""
        request_inst_children_json = super(RequestInstitutionChildren, self).make()
        request_inst_children_json['institution_requested_key'] = self.institution_requested_key.urlsafe()
        request_inst_children_json['type_of_invite'] = 'REQUEST_INSTITUTION_CHILDREN'
        return request_inst_children_json
