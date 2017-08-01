"""Invite user model."""
from invite import Invite
from google.appengine.ext import ndb
from google.appengine.api import mail
from custom_exceptions.fieldException import FieldException


class InviteUser(Invite):
    """Model of invite user."""

    @staticmethod
    def checkIsInviteUserValid(data):
        institution = ndb.Key(urlsafe=data.get('institution_key')).get()
        invitee = data.get('invitee')
        if Invite.inviteeIsMember(invitee, institution):
            raise FieldException("The invitee is already a member")
        if Invite.inviteeIsInvited(invitee, institution.key):
            raise FieldException("The invitee is already invited")

    @staticmethod
    def create(data):
        """Create a post and check required fields."""
        invite = Invite.create(data)
        InviteUser.checkIsInviteUserValid(data)
        return invite

    @staticmethod
    def sendInvite(invite):
        """Send invite."""
        InviteUser.sendInviteUser(invite)

    @staticmethod
    def sendInviteUser(invite):
        """Send Invite for user to be member of some Institution."""
        mail.send_mail(sender="e-CIS <eciis@splab.ufcg.edu.br>",
                       to=invite.invitee,
                       subject="Convite plataforma e-CIS",
                       body="""Oi:

        Para realizar o cadastro cria sua conta em:
        http://eciis-splab.appspot.com a

        Equipe e-CIS
        """)

    @staticmethod
    def make(invite):
        """Create personalized json of invite."""
        return invite.make_invite_user()

    def make_invite_user(self):
        """Create json of invite to user."""
        return {
            'invitee': self.invitee,
            'inviter': self.inviter,
            'type_of_invite': self.type_of_invite,
            'institution_key': self.institution_key.urlsafe(),
            'key': self.key.urlsafe(),
            'status': self.status
        }
