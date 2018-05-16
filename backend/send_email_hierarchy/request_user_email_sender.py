"""Request user to be member email sender model."""

from email_sender import EmailSender

MAXIMUM_INSTITUTION_NAME = 29
MAXIMUM_USER_NAME = 26

class RequestUserEmailSender(EmailSender):
    """Entity responsible for send invite institution's email."""

    def __init__(self, **kwargs):
        """The class constructor.

        It initializes the object with its html and its specific properties.
        crop_institution_name is called to make sure that the names don't exceed the maximum allowed size.
        """
        super(RequestUserEmailSender, self).__init__(**kwargs)
        self.html = kwargs['html'] if 'html' in kwargs else 'request_user_email.html'
        self.user_name = self.crop_name(kwargs['user_name'], MAXIMUM_USER_NAME)
        self.user_email = self.crop_name(kwargs['user_email'], MAXIMUM_USER_NAME)
        self.office = self.crop_name(kwargs['office'], MAXIMUM_USER_NAME)
        self.request_key = kwargs['request_key']
        self.institution_requested_admin = self.crop_name(kwargs['institution_requested_admin'], MAXIMUM_USER_NAME)
        self.institution_requested_name = self.crop_name(kwargs['institution_requested_name'], MAXIMUM_INSTITUTION_NAME)
        self.institution_requested_email = self.crop_name(kwargs['institution_requested_email'], MAXIMUM_INSTITUTION_NAME)
        self.institution_requested_key = kwargs['institution_requested_key']

    def send_email(self):
        """It enqueue a sending email task with the json that will fill the entity's html.
        
        For that, it call its super with email_json property.
        """
        email_json = {
            'user_name': self.user_name,
            'user_email': self.user_email,
            'request_key': self.request_key,
            'office': self.office,
            'institution_requested_admin': self.institution_requested_admin,
            'institution_requested_name': self.institution_requested_name,
            'institution_requested_email': self.institution_requested_email,
            'institution_requested_key': self.institution_requested_key
        }
        super(RequestUserEmailSender, self).send_email(email_json)
