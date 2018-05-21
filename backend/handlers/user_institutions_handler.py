# -*- coding: utf-8 -*-
"""User Institutions Handler."""

from google.appengine.ext import ndb
import json

from util.login_service import login_required
from utils import Utils
from utils import json_response
from send_email_hierarchy import LeaveInstitutionEmailSender
from util import get_subject 

from . import BaseHandler

__all__ = ['UserInstitutionsHandler']

class UserInstitutionsHandler(BaseHandler):
    """Handle user's operations relationed to a specific institution."""

    @json_response
    @login_required
    def delete(self, user, institution_key):
        """Handle DELETE Requests.
        
        This method delete an institution, which key is received as a paramater,
        from the user.
        In oposite of institution_members_handler's delete method, here the user requests to remove
        an intitution. There, the institution's admin makes the request.
        """
        institution_key = ndb.Key(urlsafe=institution_key)
        institution = institution_key.get()

        user.remove_institution(institution_key)

        institution.remove_member(user)

        subject = get_subject('LINK_REMOVAL')
        message = """Lamentamos informar que %s removeu o 
        vínculo com sua institutição %s
        """ % (user.name, institution.name)

        body = message + """
        Equipe da Plataforma CIS
        """

        admin = institution.admin.get()
        email_sender = LeaveInstitutionEmailSender(**{
            'receiver': admin.email,
            'subject': subject,
            'body': body
        })
        email_sender.send_email()
