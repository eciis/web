# -*- coding: utf-8 -*-
"""Institution Members Handler."""

from google.appengine.ext import ndb
import json

from util.login_service import login_required
from utils import Utils
from utils import json_response
from util.strings_pt_br import get_subject
from service_messages import send_message_notification
from send_email_hierarchy import RemoveMemberEmailSender

from . import BaseHandler

__all__ = ['InstitutionMembersHandler']

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
    @ndb.transactional(xg=True)
    def delete(self, user, url_string):
        """Delete member of specific institution."""
        institution_key = ndb.Key(urlsafe=url_string)
        user.check_permission('remove_member',
                              "User is not allowed to remove member",
                              url_string)

        institution = institution_key.get()
        member_key = self.request.get('removeMember')
        member = ndb.Key(urlsafe=member_key)
        member = member.get()

        institution.remove_member(member)

        if member.state != 'inactive':
            notification_message = institution.create_notification_message(user.key, user.current_institution)
            send_message_notification(
                receiver_key=member.key.urlsafe(),
                notification_type='DELETE_MEMBER',
                entity_key=institution.key.urlsafe(),
                message=notification_message
            )

        justification = self.request.get('justification')
        subject = get_subject('LINK_REMOVAL') if member.state != 'inactive' else get_subject('INACTIVE_USER')

        email_sender = RemoveMemberEmailSender(**{
            'receiver': member.email[0],
            'subject': subject,
            'user_name': member.name,
            'user_email': member.email[0],
            'justification': justification,
            'institution_name': institution.name,
            'institution_admin': institution.admin.get().name,
            'institution_email': institution.email,
            'institution_key': institution.key.urlsafe(),
            'html': 'remove_member_email.html' if member.state != 'inactive' else 'inactive_user_email.html'
        })
        email_sender.send_email()