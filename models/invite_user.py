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
        invited = Invite.query(
            Invite.institution_key == institutionKey,
            Invite.type_of_invite == 'user',
            Invite.status == 'sent',
            Invite.invitee == invitee)

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

    def sendInvite(self):
        """Send Invite for user to be member of some Institution."""
        mail.send_mail(sender="e-CIS <eciis@splab.ufcg.edu.br>",
                       to=self.invitee,
                       subject="Convite plataforma e-CIS",
                       body="""Oi:

        Para realizar o cadastro cria sua conta em:
        http://eciis-splab.appspot.com a

        Equipe e-CIS
        """)

    def make(self):
        """Create json of invite to user."""
        return {
            'invitee': self.invitee,
            'inviter': self.inviter,
            'type_of_invite': self.type_of_invite,
            'institution_key': self.institution_key.urlsafe(),
            'key': self.key.urlsafe(),
            'status': self.status
        }
