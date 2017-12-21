# -*- coding: utf-8 -*-
"""This file encapsulates all the system's common strings."""


STRINGS = {
    'INVITE_EMAIL': """Você foi convidado a participar da plataforma CIS,
        para realizar o cadastro acesse http://%s
        
        Equipe CIS.
        """,
    'INVITE_EMAIL_SUBJECT': """Convite plataforma CIS"""
}


def get_common_string(type_of_string, *kwargs):
    """This method returns the common string
    that matches with the type_of_email with
    the host in the end."""
    return STRINGS[type_of_string] % kwargs
