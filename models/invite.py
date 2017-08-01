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
    inviter = ndb.StringProperty(required=True)

    # Type of Invite.
    type_of_invite = ndb.StringProperty(choices=set([
        'user',
        'institution',
        'institution_parent',
        'institution_children']), required=True)

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
        invite.inviter = data.get('inviter')
        invite.type_of_invite = data.get('type_of_invite')
        invite.institution_key = ndb.Key(urlsafe=data.get('institution_key'))

        return invite

    def sendInvite(self):
        """Send invite."""
        raise FieldException("sendInvite not implemented")

    def make(self):
        """Create personalized json of invite."""
        raise FieldException("make not implemented")

    def change_status(self, status):
        """Change the invite state."""
        self.status = status
        self.put()
