"""Request user model."""

from invite import Invite
from google.appengine.ext import ndb
from custom_exceptions.fieldException import FieldException
from models.institution import Institution


class RequestInstitutionLink(Invite):
    """Model of request user."""

    @staticmethod
    def senderIsAdmin(sender_key, institution):
        user = ndb.Key(urlsafe=sender_key).get()
        return institution.admin == sender_key and institution.key in user.institutions_admin

    @staticmethod
    def senderIsInvited(sender_key, institutionKey):
        sender_key = ndb.Key(urlsafe=sender_key)
        request = RequestInstitutionLink.query(
            RequestInstitutionLink.institution_key == institutionKey,
            RequestInstitutionLink.status == 'sent',
            RequestInstitutionLink.sender_key == sender_key)

        return request.count() > 0

    def isValid(self):
        institution = self.institution_key.get()
        sender = self.sender_key.urlsafe()
        if not sender:
            raise FieldException("The request require sender_key")
        if RequestInstitutionLink.senderIsMember(sender, institution):
            raise FieldException("The sender is already a member")
        if RequestInstitutionLink.senderIsInvited(sender, institution.key):
            raise FieldException("The sender is already invited")

    @staticmethod
    def create(data):
        """Create a post and check required fields."""
        request = RequestInstitutionLink()
        request.sender_key = ndb.Key(urlsafe=data.get('sender_key'))
        request = Invite.create(data, request)
        request.isValid()
        return request

    def send_notification(self, user):
        """Method of send notification of invite user."""
        entity_type = 'REQUEST_INSTITUTION_LINK'
        super(RequestInstitutionLink, self).send_notification(user, entity_type)

    def make(self):
        """Create json of invite to user."""
        invite_user_json = super(RequestInstitutionLink, self).make()
        invite_user_json['sender'] = self.sender_key.get().email
        invite_user_json['institution_key'] = self.institution_key.urlsafe()
        invite_user_json['type_of_invite'] = 'REQUEST_USER'
        return invite_user_json
