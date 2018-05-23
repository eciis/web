# -*- coding: utf-8 -*-
"""This file encapsulates all the system's pt-br strings."""

SUBJECT_TRANSLATION = {
    'INVITE': 'Convite plataforma CIS',
    'LINK_REMOVAL': 'Remoção de vínculo',
    'INSTITUION_REMOVAL': 'Remoção de instituição',
    'LINK_CONFIRM': 'Confirmação de vínculo',
    'REQUEST_USER': 'Solicitação de participação plataforma CIS',
    'RESPONSE_REQUEST_USER': 'Resposta à sua solicitação de participação da plataforma CIS',
    'REQUEST_INSTITUTION': 'Solicitação de criação de instituição na plataforma CIS',
    'ACCEPTED_REQUEST_INSTITUTION': 'Instituição aceita na Plataforma Virtual CIS.',
    'REJECTED_REQUEST_INSTITUTION': 'Solicitação para criar instituição na Plataforma Virtual CIS foi rejeitada.',    
    'REQUEST_LINK': 'Novo convite de vínculo na Plataforma Virtual CIS.',
    'REJECT_LINK_EMAIL': "Seu vínculo não foi aprovado.",
    'REMOVED_LINK_EMAIL': 'Vínculo removido na Plataforma Virtual CIS.',
    'INACTIVE_USER': "Você foi removido da Plataforma Virtual CIS."
}


def get_subject(type_of_subject, *kwargs):
    """This method returns the pt-br translated subject
    that matches with its type."""
    return SUBJECT_TRANSLATION[type_of_subject] % kwargs
