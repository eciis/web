"""Accepte institution link email sender model."""

from email_sender import EmailSender

MAXIMUM_INSTITUTION_NAME = 29

class AcceptInstitutionLinkEmailSender(EmailSender):
    def __init__(self, **kwargs):
        """The class constructor.

        It initializes the object with its html and its specific properties.
        crop_institution_name is called to make sure that the names don't exceed the maximum allowed size.
        """
        super(AcceptInstitutionLinkEmailSender, self).__init__(**kwargs)
        self.html = 'accept_institution_link_email.html'
        self.institution_name = self.crop_name(kwargs['user_name'], MAXIMUM_INSTITUTION_NAME)
        self.institution_email = self.crop_name(kwargs['user_email'], MAXIMUM_INSTITUTION_NAME)
        self.request_key = kwargs['request_key']
        self.institution_requested_name = self.crop_name(kwargs['institution_requested_name'], MAXIMUM_INSTITUTION_NAME)
        self.institution_requested_email = self.crop_name(kwargs['institution_requested_email'], MAXIMUM_INSTITUTION_NAME)
        self.institution_requested_key = kwargs['institution_requested_key']
    

    def send_email(self):
        """It enqueue a sending email task with the json that will fill the entity's html.
        
        For that, it call its super with email_json property.
        """
        email_json = {
            'institution_name': self.institution_name,
            'institution_email': self.institution_email,
            'request_key': self.request_key,
            'institution_requested_name': self.institution_requested_name,
            'institution_requested_email': self.institution_requested_email,
            'institution_requested_key': self.institution_requested_key
        }
        super(AcceptInstitutionLinkEmailSender, self).send_email(email_json)
