"""Request to create institution email sender model."""

from email_sender import EmailSender

MAXIMUM_INSTITUTION_NAME = 29
MAXIMUM_USER_NAME = 26
MAXIMUM_DESCRIPTION = 84

class RequestInstitutionEmailSender(EmailSender):
    """Entity responsible for request institution's email."""

    def __init__(self, **kwargs):
        """The class constructor.

        It initializes the object with its html and its specific properties.
        crop_institution_name is called to make sure that the names don't exceed the maximum allowed size.
        """
        super(RequestInstitutionEmailSender, self).__init__(**kwargs)
        self.html = kwargs['html']
        self.user_name = self.crop_name(kwargs['user_name'], MAXIMUM_USER_NAME)
        self.user_email = self.crop_name(kwargs['user_email'], MAXIMUM_USER_NAME)
        self.description = self.crop_name(kwargs['description'], MAXIMUM_DESCRIPTION)
        self.institution_name = self.crop_name(kwargs['institution_name'], MAXIMUM_INSTITUTION_NAME)
        self.institution_requested_key = kwargs['institution_requested_key']

    def send_email(self):
        """It enqueue a sending email task with the json that will fill the entity's html.
        
        For that, it call its super with email_json property.
        """
        email_json = {
            'user_name': self.user_name,
            'user_email': self.user_email,
            'description': self.description,
            'institution_name': self.institution_name,
            'institution_requested_key': self.institution_requested_key
        }
        super(RequestInstitutionEmailSender, self).send_email(email_json)
