# -*- coding: utf-8 -*-
"""Request institution Model."""

from . import Invite
from . import Request
from google.appengine.ext import ndb
from util.provider_institutions import get_deciis
from custom_exceptions.fieldException import FieldException
from send_email_hierarchy.accepted_institution_email_sender import AcceptedInstitutionEmailSender


__all__ = ['RequestInstitution']

class RequestInstitution(Request):
    """Request Institution Model."""

    def isValid(self):
        sender = self.sender_key
        if not sender:
            raise FieldException("The request require sender_key")

    @staticmethod
    def create(data):
        """Create a post and check required fields."""
        request = RequestInstitution()
        request.sender_key = ndb.Key(urlsafe=data.get('sender_key'))
        request = Invite.create(data, request)
        request.institution_requested_key = get_deciis().key
        request.isValid()
        return request

    def send_response_email(self, operation, host=None):
        """Method to send email of sender institution when invite is accepted or rejected."""
        if operation == "ACCEPT":
            subject = """Instituição aceita na Plataforma Virtual CIS."""
            email_sender = AcceptedInstitutionEmailSender(**{
                'receiver': self.sender_key.get().email[0],
                'subject': subject,
                'institution_key': self.institution_key.urlsafe(),
            })
            email_sender.send_email()
        else:
            rejectMessage = """Olá,
            Lamentamos informar mas o seu pedido não foi aceito.
            Sugerimos que fale com o seu superior para que seja enviado um convite.
            Equipe da Plataforma CIS"""

            sender_email = self.sender_key.get().email[0]
            super(RequestInstitution, self).send_email(
                host, sender_email, rejectMessage)

    def send_email(self, host, body=None):
        """Method of send email of request institution link."""
        body = body or """Olá
        A instituição %s deseja se cadastrar na Plataforma. Acesse:
        http://frontend.plataformacis.org/

        Equipe da Plataforma CIS. """ % self.institution_key.get().name

        """
            The super user is the admin of 
            'Departamento do Complexo Industrial e Inovação em Saúde".
        """
        super_user = get_deciis().admin.get()
        super(RequestInstitution, self).send_email(host, super_user.email, body)

    def send_notification(self, current_institution):
        """Method of send notification of request intitution."""
        notification_type = 'REQUEST_INSTITUTION'

        """
            The super user is the admin of 
            'Departamento do Complexo Industrial e Inovação em Saúde".
        """
        super_user = get_deciis().admin.get()
        notification_message = self.create_notification_message(user_key=self.sender_key, 
        receiver_institution_key=self.institution_requested_key)
        super(RequestInstitution, self).send_notification(
            current_institution=current_institution, 
            receiver_key=super_user.key,
            notification_type=notification_type,
            message=notification_message
        )

    def make(self):
        """Create json of request to institution."""
        request_inst_json = super(RequestInstitution, self).make()
        request_inst_json['type_of_invite'] = 'REQUEST_INSTITUTION'
        request_inst_json['institution_name'] = self.institution_key.get().name
        return request_inst_json
