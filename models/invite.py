# -*- coding: utf-8 -*-
"""Invite Model."""
from google.appengine.ext import ndb
from google.appengine.ext.ndb.polymodel import PolyModel
from custom_exceptions.fieldException import FieldException


class Invite(PolyModel):
    """Model of Invite."""

    # Email of the invitee.
    invitee = ndb.StringProperty(required=True)

    # Inviter email
    inviter = ndb.KeyProperty(kind="User", required=True)

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

    @staticmethod
    def create(data, invite):
        """Create a post and check required fields."""
        invite.invitee = data.get('invitee')
        invite.inviter = ndb.Key(urlsafe=data.get('inviter'))
        invite.institution_key = ndb.Key(urlsafe=data.get('institution_key'))

        return invite

    def sendInvite(self, host):
        """Send invite."""
        raise FieldException("sendInvite not implemented")

    def make(self):
        """Create personalized json of invite."""
        return {
            'invitee': self.invitee,
            'inviter': self.inviter.get().name,
            'key': self.key.urlsafe(),
            'status': self.status,
            'institution_inviter': self.institution_key.get().make(['name'])
        }

    def change_status(self, status):
        """Change the invite state."""
        self.status = status
        self.put()
