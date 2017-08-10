"""Invite user model."""
from invite import Invite
from google.appengine.ext import ndb
from google.appengine.api import mail
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
        invite = Invite.create(data, invite)
        InviteUser.checkIsInviteUserValid(data)
        return invite

    def sendInvite(self, host):
        """Send Invite for user to be member of some Institution."""
        institution_key = self.institution_key.urlsafe()
        invite_key = self.key.urlsafe()

        mail.send_mail(sender="e-CIS <eciis@splab.ufcg.edu.br>",
                       to=self.invitee,
                       subject="Convite plataforma e-CIS",
                       body="""Oi:

        Voce tem um novo convite. Acesse:
        http://%s/app/#/institution/%s/%s/new_invite/USER

        Equipe e-CIS """ % (host, institution_key, invite_key))

    def make(self):
        """Create json of invite to user."""
        invite_user_json = super(InviteUser, self).make()
        invite_user_json['institution_key'] = self.institution_key.urlsafe()
        invite_user_json['type_of_invite'] = 'USER'
        return invite_user_json
