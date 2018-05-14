# -*- coding: utf-8 -*-
"""This file encapsulates all the system's pt-br strings."""


SUBJECT_TRANSLATION = {
    'INVITE': 'Convite plataforma CIS',
    'LINK_REMOVAL': 'Remoção de vínculo',
    'INSTITUION_REMOVAL': 'Remoção de instituição',
}


def get_subject(type_of_email, *kwargs):
    """This method returns the pt-br translated subject
    that matches with the type_of_email."""
    return SUBJECT_TRANSLATION[type_of_string] % kwargs
