# -*- coding: utf-8 -*-
"""Invite Model."""
from google.appengine.ext import ndb
from google.appengine.ext.ndb.polymodel import PolyModel
from models.user import User
from service_messages import send_message_email
from service_messages import send_message_notification
import json


class Invite(PolyModel):
    """Model of Invite."""

    # Email of the invitee.
    invitee = ndb.StringProperty()

    # Key of user inviter
    admin_key = ndb.KeyProperty(kind="User", required=True)

    # Key of user sender
    sender_key = ndb.KeyProperty(kind="User")

    # Status of Invite.
    status = ndb.StringProperty(choices=set([
        'sent',
        'accepted',
        'rejected']), default='sent')

    # Name of the institution invited, if the type of invite is institution.
    suggestion_institution_name = ndb.StringProperty()

    """ Key of the institution who inviter is associate."""
    institution_key = ndb.KeyProperty(kind="Institution")

    # Key of stub institution to wich the invite was send.
    # Value is None for invite the User
    stub_institution_key = ndb.KeyProperty(kind="Institution")

    is_request = ndb.BooleanProperty(default=False)

    @staticmethod
    def create(data, invite):
        """Create a post and check required fields."""
        invite.is_request = data.get('is_request') or False
        invite.admin_key = ndb.Key(urlsafe=data.get('admin_key'))
        invite.institution_key = ndb.Key(urlsafe=data.get('institution_key'))

        return invite

    def sendInvite(self, user, host):
        """Send invite."""
        self.send_email(host)
        self.send_notification(user)

    def send_email(self, host, body=None):
        """Method of send email of invite user."""
        body = body or """Você foi convidado a participar da plataforma e-CIS,
        para realizar o cadastro acesse http://%s

        Equipe e-CIS
        """ % (host)

        send_message_email(
            self.invitee,
            body
        )

    def send_notification(self, user, entity_type=None):
        """Method of send notification of invite user.

        Keyword arguments:
        user -- user email that did the action.
        entity_type -- type of notification.
        Case not receive use invite type.
        """
        user_found = User.query(User.email == self.invitee).fetch(1)

        entity_type = entity_type or 'INVITE'

        if user_found:
            invitee = user_found[0]
            message = json.dumps({
                'from': user.name, 'type': 'INVITE'
            })

            send_message_notification(
                invitee.key.urlsafe(),
                message,
                entity_type,
                self.key.urlsafe()
            )

    def make(self):
        """Create personalized json of invite."""
        return {
            'admin_name': self.admin_key.get().name,
            'key': self.key.urlsafe(),
            'status': self.status,
            'institution_admin': self.institution_key.get().make(['name'])
        }

    def change_status(self, status):
        """Change the invite state."""
        self.status = status
        self.put()
