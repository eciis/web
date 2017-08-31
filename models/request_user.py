"""Request user model."""

from invite import Invite
from google.appengine.ext import ndb
from custom_exceptions.fieldException import FieldException
from models.user import User
from models.institution import Institution


class RequestUser(Invite):
    """Model of request user."""

    @staticmethod
    def senderIsMember(sender_key, institution):
        user = ndb.Key(urlsafe=sender_key).get()
        if user:
            instmember = Institution.query(Institution.members.IN(
                [user.key]),
                Institution.key == institution.key)
            return instmember.count() > 0
        return False

    @staticmethod
    def senderIsInvited(sender_key, institutionKey):
        sender_key = ndb.Key(urlsafe=sender_key)
        request = RequestUser.query(
            RequestUser.institution_key == institutionKey,
            RequestUser.status == 'sent',
            RequestUser.sender_key == sender_key)

        return request.count() > 0

    @staticmethod
    def checkIsRequestUserValid(data):
        institution = ndb.Key(urlsafe=data.get('institution_key')).get()
        sender = data.get('sender_key')
        if RequestUser.senderIsMember(sender, institution):
            raise FieldException("The sender is already a member")
        if RequestUser.senderIsInvited(sender, institution.key):
            raise FieldException("The sender is already invited")

    @staticmethod
    def create(data):
        """Create a post and check required fields."""
        request = RequestUser()
        request.sender_key = ndb.Key(urlsafe=data.get('sender_key'))
        request = Invite.create(data, request)
        RequestUser.checkIsRequestUserValid(data)
        return request

    def send_email(self, host, body=None):
        """Method of send email of invite user."""
        institution_key = self.institution_key.urlsafe()
        invite_key = self.key.urlsafe()

        # TODO Set this message
        body = body or """Oi:
        Voce tem um novo convite. Acesse:
        http://%s/app/#/institution/%s/%s/new_invite/USER

        Equipe e-CIS """ % (host, institution_key, invite_key)
        super(RequestUser, self).send_email(host, body)

    def send_notification(self, user):
        """Method of send notification of invite user."""
        entity_type = 'REQUEST_USER'
        super(RequestUser, self).send_notification(user, entity_type)

    def make(self):
        """Create json of invite to user."""
        invite_user_json = super(RequestUser, self).make()
        invite_user_json['sender'] = self.sender_key.get().email
        invite_user_json['institution_key'] = self.institution_key.urlsafe()
        invite_user_json['type_of_invite'] = 'REQUEST_USER'
        return invite_user_json
