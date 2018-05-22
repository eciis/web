# -*- coding: utf-8 -*-
"""This file encapsulates all the system's pt-br strings."""

__all__ = ['SUBJECT_TRANSLATION', 'get_subject']

SUBJECT_TRANSLATION = {
    'INVITE': 'Convite plataforma CIS',
    'LINK_REMOVAL': 'Remoção de vínculo',
    'INSTITUION_REMOVAL': 'Remoção de instituição',
    'LINK_CONFIRM': 'Confirmação de vínculo',
    'REQUEST_USER': 'Solicitação de participação plataforma CIS',
    'RESPONSE_REQUEST_USER': 'Resposta à sua solicitação de participação da plataforma CIS',
    'REQUEST_LINK': 'Novo convite de vínculo na Plataforma Virtual CIS.',
    'REJECT_LINK_EMAIL': "Seu vínculo não foi aprovado.",
    'REMOVED_LINK_EMAIL': 'Vínculo removido na Plataforma Virtual CIS.',
    'INACTIVE_USER': "Você foi removido da Plataforma Virtual CIS.",
    'TRANSFER_ADM_EMAIL': 'Você foi indicado para ser administrador de uma instituição na Plataforma Virtual CIS.'
}


def get_subject(type_of_subject, *kwargs):
    """This method returns the pt-br translated subject
    that matches with its type."""
    return SUBJECT_TRANSLATION[type_of_subject] % kwargs
