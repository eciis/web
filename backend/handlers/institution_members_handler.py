# -*- coding: utf-8 -*-
"""Institution Members Handler."""

from google.appengine.ext import ndb
import json

from handlers.institution_handler import is_admin
from utils import login_required
from utils import Utils
from utils import json_response
from service_messages import send_message_notification
from service_messages import send_message_email

from handlers.base_handler import BaseHandler


class InstitutionMembersHandler(BaseHandler):
    """Get members of specific institution."""

    @json_response
    @login_required
    def get(self, user, url_string):
        """Get members of specific institution."""
        institution_key = ndb.Key(urlsafe=url_string)
        institution = institution_key.get()

        array = [member.get() for member in institution.members]

        self.response.write(json.dumps(Utils.toJson(array)))

    @json_response
    @login_required
    @is_admin
    @ndb.transactional(xg=True)
    def delete(self, user, url_string):
        """Delete member of specific institution."""
        institution_key = ndb.Key(urlsafe=url_string)
        institution = institution_key.get()

        data = self.request.get('removeMember')
        member = ndb.Key(urlsafe=data)
        member = member.get()

        institution.remove_member(member)

        if member.state != 'inactive':
            entity_type = 'DELETE_MEMBER'
            message = {'type': 'DELETE_MEMBER', 'from': user.name.encode('utf8')}
            send_message_notification(
                member.key.urlsafe(),
                json.dumps(message),
                entity_type,
                institution.key.urlsafe())

        subject = "Remoção de vínculo"
        message = """Lamentamos informar que seu vínculo com a instituição %s
        foi removido pelo administrador %s
        """ % (institution.name, user.name)

        reasonToRemove = self.request.get('reasonToRemove')

        if reasonToRemove:
            message = message + """pelo seguinte motivo:
            '%s'
            """ % (reasonToRemove)

        body = message + """

        Equipe e-CIS
        """
        send_message_email(
            member.email,
            body,
            subject
        )
