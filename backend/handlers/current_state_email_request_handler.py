# -*- coding: utf-8 -*-
"""User Request Handler."""

import json

from util import login_required
from utils import json_response
from . import BaseHandler
from send_email_hierarchy import RequestStateEmailSender

__all__ = ['CurrentStateEmailRequestHandler']


class CurrentStateEmailRequestHandler(BaseHandler):
    """Email request handler."""

    @login_required
    @json_response
    def post(self, user):
        body = json.loads(self.request.body)

        subject = "Link para preenchimento de formulario"

        email_sender = RequestStateEmailSender(**{
            'receiver': user.email,
            'subject': subject,
            'body': body
        })
        email_sender.send_email()
