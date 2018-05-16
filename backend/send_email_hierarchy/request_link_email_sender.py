"""Request an institution to make a connection with another one."""

from email_sender import EmailSender

MAXIMUM_INSTITUTION_NAME = 29


class RequestLinkEmailSender(EmailSender):
    """Entity responsible for send request link's email."""

    def __init__(self, **kwargs):
        """The class constructor.

        It initializes the object with its html and its specific properties.
        crop_institution_name is called to make sure that the names don't exceed the maximum allowed size.
        """
        super(RequestLinkEmailSender, self).__init__(**kwargs)
        self.html = 'request_link_email.html'
        if 'html' in kwargs:
            self.html = kwargs['html']
        self.institution_parent_name = self.crop_name(
            kwargs['institution_parent_name'], MAXIMUM_INSTITUTION_NAME)
        self.institution_parent_email = self.crop_name(
            kwargs['institution_parent_email'], MAXIMUM_INSTITUTION_NAME)
        self.institution_child_name = self.crop_name(
            kwargs['institution_child_name'], MAXIMUM_INSTITUTION_NAME)
        self.institution_child_email = self.crop_name(
            kwargs['institution_child_email'], MAXIMUM_INSTITUTION_NAME)
        self.institution_requested_key = kwargs['institution_requested_key']

    def send_email(self):
        """It enqueue a sending email task with the json that will fill the entity's html.
        
        For that, it call its super with email_json property.
        """
        email_json = {
            'institution_parent_name': self.institution_parent_name,
            'institution_parent_email': self.institution_parent_email,
            'institution_child_name': self.institution_child_name,
            'institution_child_email': self.institution_child_email,
            'institution_requested_key': self.institution_requested_key
        }
        super(RequestLinkEmailSender, self).send_email(email_json)
