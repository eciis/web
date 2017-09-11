"""Request institution link model."""

from invite import Invite
from google.appengine.ext import ndb
from custom_exceptions.fieldException import FieldException


class RequestInstitutionParent(Invite):
    """Model of request parent institution."""

    @staticmethod
    def senderIsAdmin(sender_key, institution):
        user = ndb.Key(urlsafe=sender_key).get()
        return institution.admin == sender_key and institution.key in user.institutions_admin

    @staticmethod
    def isLinked(institution, institution_requested):
        isParent = institution == institution_requested.parent_institution
        isChildren = institution in institution_requested.children_institutions

        return isParent or isChildren

    @staticmethod
    def isRequested(sender, institution_requested_key):
        request = RequestInstitutionParent.query(
            RequestInstitutionParent.institution_key == institution_requested_key,
            RequestInstitutionParent.status == 'sent',
            RequestInstitutionParent.sender_key == sender)

        return request.count() > 0

    def isValid(self):
        institution_key = self.institution_key
        sender = self.sender_key
        institution_requested = self.institution_requested_key.get()
        if not sender:
            raise FieldException("The request require sender_key")
        if not institution_requested:
            raise FieldException("The request require institution_requested")
        if RequestInstitutionParent.isLinked(institution_key, institution_requested):
            raise FieldException("The institutions is already a linked")
        if RequestInstitutionParent.isRequested(sender, institution_key):
            raise FieldException("The sender is already invited")

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
        """Method of send email of invite user."""
        institution_key = self.institution_key.urlsafe()
        invite_key = self.key.urlsafe()
        admin_email = self.admin_key.get().email

        # TODO Set this message
        body = body or """Oi:
        Voce tem um novo convite. Acesse:
        http://%s/app/#/institution/%s/%s/new_invite/USER

        Equipe e-CIS """ % (host, institution_key, invite_key)
        super(RequestInstitutionParent, self).send_email(host, admin_email, body)


    def send_notification(self, user):
        """Method of send notification of invite user."""
        entity_type = 'REQUEST_INSTITUTION_PARENT'
        super(RequestInstitutionParent, self).send_notification(user, entity_type)

    def make(self):
        """Create json of invite to user."""
        request_inst_parent_json = super(RequestInstitutionParent, self).make()
        request_inst_parent_json['sender'] = self.sender_key.get().email
        request_inst_parent_json['institution_key'] = self.institution_key.urlsafe()
        request_inst_parent_json['institution_requested_key'] = self.institution_requested_key.urlsafe()
        request_inst_parent_json['type_of_invite'] = 'REQUEST_INSTITUTION_PARENT'
        return request_inst_parent_json
