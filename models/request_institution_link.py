"""Request user model."""

from invite import Invite
from google.appengine.ext import ndb
from custom_exceptions.fieldException import FieldException
from models.institution import Institution


class RequestInstitutionParent(Invite):
    """Model of request user."""

    @staticmethod
    def senderIsAdmin(sender_key, institution):
        user = ndb.Key(urlsafe=sender_key).get()
        return institution.admin == sender_key and institution.key in user.institutions_admin

    @staticmethod
    def isLinked(institution, institution_requested):
        isParent = institution.key == institution_requested.parent_institution
        isChildren = institution.key in institution_requested.children_institutions

        return isParent or isChildren

    @staticmethod
    def IsRequested(sender, institution_requested_key):
        request = RequestInstitutionParent.query(
            RequestInstitutionParent.institution_key == institution_requested_key,
            RequestInstitutionParent.status == 'sent',
            RequestInstitutionParent.sender_key == sender)

        return request.count() > 0

    def isValid(self):
        institution_key = self.institution_key
        sender = self.sender_key.urlsafe()
        institution_requested = self.institution_key_requested.get()
        if not sender:
            raise FieldException("The request require sender_key")
        if not institution_requested:
            raise FieldException("The request require institution_requested")
        if RequestInstitutionParent.isLinked(institution_key, institution_requested):
            raise FieldException("The institutions is already a linked")
        if RequestInstitutionParent.IsRequested(sender, institution_key):
            raise FieldException("The sender is already invited")

    @staticmethod
    def create(data):
        """Create a post and check required fields."""
        request = RequestInstitutionParent()
        request.sender_key = ndb.Key(urlsafe=data.get('sender_key'))
        request = Invite.create(data, request)
        request.isValid()
        return request

    def send_notification(self, user):
        """Method of send notification of invite user."""
        entity_type = 'REQUEST_INSTITUTION_PARENT'
        super(RequestInstitutionParent, self).send_notification(user, entity_type)

    def make(self):
        """Create json of invite to user."""
        invite_user_json = super(RequestInstitutionParent, self).make()
        invite_user_json['sender'] = self.sender_key.get().email
        invite_user_json['institution_key'] = self.institution_key.urlsafe()
        invite_user_json['type_of_invite'] = 'REQUEST_USER'
        return invite_user_json
