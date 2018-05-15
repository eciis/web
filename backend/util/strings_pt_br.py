# -*- coding: utf-8 -*-
"""This file encapsulates all the system's pt-br strings."""

SUBJECT_TRANSLATION = {
    'INVITE': 'Convite plataforma CIS',
    'LINK_REMOVAL': 'Remoção de vínculo',
    'INSTITUION_REMOVAL': 'Remoção de instituição',
    'REQUEST_EMAIL_SUBJECT': """Solicitação de participação plataforma CIS""",
    'REQUEST_LINK_EMAIL_SUBJECT': """Novo convite de vínculo na Plataforma Virtual CIS."""
}


def get_subject(type_of_subject, *kwargs):
    """This method returns the pt-br translated subject
    that matches with its type."""
    return SUBJECT_TRANSLATION[type_of_subject] % kwargs
