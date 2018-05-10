# -*- coding: utf-8 -*-
"""This file encapsulates all the system's pt-br strings."""


STRINGS = {
    'INVITE_EMAIL_SUBJECT': """Convite plataforma CIS""",
    'REQUEST_EMAIL_SUBJECT': """Solicitação de participação plataforma CIS"""
}


def get_string(type_of_string, *kwargs):
    """This method returns the pt-br string
    that matches with the type_of_email."""
    return STRINGS[type_of_string] % kwargs
