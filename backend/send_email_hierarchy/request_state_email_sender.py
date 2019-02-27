# -*- coding: utf-8 -*-
"""Request state email sender."""

from . import EmailSender

__all__ = ['RequestStateEmailSender']


class RequestStateEmailSender(EmailSender):
    """Entity responsible to send state link email."""

    def __init__(self, **kwargs):
        """The class constructor.

        It initializes the object with its html and its specific properties.
        """
        super(RequestStateEmailSender, self).__init__(**kwargs)
        self.subject = "Link para preenchimento de formulario"
        self.html = "request_state_email.html"

    def send_email(self):
        """It enqueue a sending email task with the json that will fill the entity's html.

        For that, it call its super with email_json property.
        """
        email_json = {
            'state_link': self.__get_state_link()
        }
        super(RequestStateEmailSender, self).send_email(email_json)

    def __get_state_link(self):
        return self.__get_data()['state-link']

    def __get_data(self):
        return self.body['data']
