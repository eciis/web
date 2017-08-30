"""Invite user model."""
from invite import Invite
from google.appengine.ext import ndb
from custom_exceptions.fieldException import FieldException
from models.user import User
from models.institution import Institution


class InviteUser(Invite):
    """Model of invite user."""

    @staticmethod
    def inviteeIsMember(inviteeEmail, institution):
        userWithEmail = User.query(User.email == inviteeEmail)
        if userWithEmail.count() == 1:
            instmember = Institution.query(Institution.members.IN(
                [userWithEmail.get().key]),
                Institution.key == institution.key)
            return instmember.count() > 0
        return False

    @staticmethod
    def inviteeIsInvited(invitee, institutionKey):
        invited = InviteUser.query(
            InviteUser.institution_key == institutionKey,
            InviteUser.status == 'sent',
            InviteUser.invitee == invitee)

        return invited.count() > 0

    @staticmethod
    def checkIsInviteUserValid(data):
        institution = ndb.Key(urlsafe=data.get('institution_key')).get()
        invitee = data.get('invitee')
        if InviteUser.inviteeIsMember(invitee, institution):
            raise FieldException("The invitee is already a member")
        if InviteUser.inviteeIsInvited(invitee, institution.key):
            raise FieldException("The invitee is already invited")

    @staticmethod
    def create(data):
        """Create a post and check required fields."""
        invite = InviteUser()
        invite.invitee = data.get('invitee')
        invite = Invite.create(data, invite)
        InviteUser.checkIsInviteUserValid(data)
        return invite

    def send_email(self, host, body=None):
        """Method of send email of invite user."""
        institution_key = self.institution_key.urlsafe()
        invite_key = self.key.urlsafe()

        body = body or """Oi:
        Voce tem um novo convite. Acesse:
        http://%s/app/#/institution/%s/%s/new_invite/USER

        Equipe e-CIS """ % (host, institution_key, invite_key)
        super(InviteUser, self).send_email(host, body)

    def send_notification(self, user):
        """Method of send notification of invite user."""
        entity_type = 'USER'

        user_found = User.query(User.email == self.invitee).fetch(1)

        if user_found and user_found[0].state == 'active':
            invitee = user_found[0]
            super(InviteUser, self).send_notification(user, invitee.key.urlsafe(), entity_type)

    def make(self):
        """Create json of invite to user."""
        invite_user_json = super(InviteUser, self).make()
        invite_user_json['invitee'] = self.invitee
        invite_user_json['institution_key'] = self.institution_key.urlsafe()
        invite_user_json['type_of_invite'] = 'USER'
        return invite_user_json
