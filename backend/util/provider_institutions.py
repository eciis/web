# -*- coding: utf-8 -*-
from models import Institution


def get_health_ministry():
    """Get health ministry institution."""
    query = Institution.query(Institution.name == "Ministério da Saúde", Institution.acronym == "MS")
    return query.get()

def get_deciis():
    """Get health ministry institution."""
    query = Institution.query(Institution.trusted == True)
    return query.get()