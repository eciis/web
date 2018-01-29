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

        Equipe e-CIS """ % (host, request_key)
        super(RequestInstitutionChildren, self).send_email(host, requested_email, body)

    def send_notification(self, current_institution):
        """Method of send notification of request institution children."""
        entity_type = 'REQUEST_INSTITUTION_CHILDREN'
        admin = self.institution_requested_key.get().admin
        super(RequestInstitutionChildren, self).send_notification(
            current_institution=current_institution, 
            receiver_key=admin.key, 
            entity_type=entity_type
        )

    def send_response_notification(self, current_institution, invitee_key, action):
        """Send notification to sender of invite when invite is accepted or rejected."""
        entity_type = 'ACCEPT_INSTITUTION_LINK' if action == 'ACCEPT' else 'REJECT_INSTITUTION_LINK'
        super(RequestInstitutionChildren, self).send_notification(
            current_institution=current_institution, 
            sender_key=invitee_key, 
            receiver_key=self.sender_key or self.admin_key,
            entity_type=entity_type
        )

    def make(self):
        """Create json of request to institution children."""
        request_inst_children_json = super(RequestInstitutionChildren, self).make()
        request_inst_children_json['institution_requested_key'] = self.institution_requested_key.urlsafe()
        request_inst_children_json['type_of_invite'] = 'REQUEST_INSTITUTION_CHILDREN'
        return request_inst_children_json
