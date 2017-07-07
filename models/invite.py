# -*- coding: utf-8 -*-
"""Invite Model."""
from google.appengine.ext import ndb
from google.appengine.api import mail
from custom_exceptions.fieldException import FieldException


class Invite(ndb.Model):
    """Model of Invite."""

    # Email of the invitee.
    invitee = ndb.StringProperty(required=True)

    # Type of Invite.
    type_of_invite = ndb.StringProperty(choices=set([
        'user',
        'institution']), required=True)

    # Status of Invite.
    status = ndb.StringProperty(choices=set([
        'sent',
        'resolved']), default='sent')

    # Name of the institution invited, if the type of invite is institution.
    suggestion_institution_name = ndb.StringProperty()

    """ Key of the institution who user was
    invited to be member, if the type of invite is user."""
    institution_key = ndb.KeyProperty(kind="Institution")

    @staticmethod
    def checkIsInviteUserValid(data):
        """Check if invite for user is valid."""
        if data.get('institution_key') is None:
            raise FieldException(
                "The invite for user have to specify the institution")

    @staticmethod
    def checkIsInviteInstitutionValid(data):
        """Check if invite for institution is valid."""
        if data.get('suggestion_institution_name') is None:
            raise FieldException(
                "The invite for institution have to specify the suggestion institution name")

    @staticmethod
    def create(data):
        """Create a post and check required fields."""
        invite = Invite()
        invite.invitee = data.get('invitee')
        invite.type_of_invite = data.get('type_of_invite')

        if (invite.type_of_invite == 'user'):
            Invite.checkIsInviteUserValid(data)
            invite.institution_key = ndb.Key(urlsafe=data['institution_key'])
        else:
            Invite.checkIsInviteInstitutionValid(data)
            invite.suggestion_institution_name = data[
                'suggestion_institution_name']
        return invite

    @staticmethod
    def sendInvite(invite):
        """Send invite."""
        if invite.type_of_invite == 'user':
            Invite.sendInviteUser(invite)
        Invite.sendInviteInstitution(invite)

    @staticmethod
    def sendInviteUser(invite):
        """Send Invite for user to be member of some Institution."""
        mail.send_mail(sender="e-CIS <eciis@splab.ufcg.edu.br>",
                   to="<%s>" % invite.invitee,
                   subject="Convite plataforma e-CIS",
                   body="""Oi:

        Para realizar o cadastro cria sua conta em:
        http://eciis-splab.appspot.com a

        Equipe e-CIS
        """)

    @staticmethod
    def sendInviteInstitution(invite):
        """Send Invite for user create some Institution."""
        mail.send_mail(sender="e-CIS <eciis@splab.ufcg.edu.br>",
                   to="<%s>" % invite.invitee,
                   subject="Convite plataforma e-CIS",
                   body="""
        Sua empresa %s foi convidada a se cadastrar na plataforma.
        Para realizar o cadastro crie sua conta pessoal em
        http://eciis-splab.appspot.com  e proceda com o cadastro da sua empresa.

        Equipe e-CIS
        """ % invite.suggestion_institution_name)

    @staticmethod
    def make(invite):
        """Create personalized json of invite."""
        if invite.type_of_invite == 'user':
            return {
                'invitee': invite.invitee,
                'type_of_invite': invite.type_of_invite,
                'institution_key': invite.institution_key.urlsafe(),
                'key': invite.key.urlsafe(),
                'status': invite.status
            }
        else:
            return {
                'invitee': invite.invitee,
                'type_of_invite': invite.type_of_invite,
                'suggestion_institution_name': invite.suggestion_institution_name,
                'key': invite.key.urlsafe(),
                'status': invite.status
            }
