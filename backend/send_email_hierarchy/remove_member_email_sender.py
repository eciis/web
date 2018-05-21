"""Remove member email sender model."""

from . import EmailSender

MAXIMUM_INSTITUTION_NAME = 29
MAXIMUM_USER_NAME = 26

class RemoveMemberEmailSender(EmailSender):

    def __init__(self, **kwargs):
        """The class constructor.

        It initializes the object with its html and its specific properties.
        crop_institution_name is called to make sure that the names don't exceed the maximum allowed size.
        """
        super(RemoveMemberEmailSender, self).__init__(**kwargs)
        self.html = kwargs['html']
        self.user_name = self.crop_name(kwargs['user_name'], MAXIMUM_USER_NAME)
        self.user_email = self.crop_name(kwargs['user_email'], MAXIMUM_USER_NAME)
        self.justification = kwargs['justification'] if 'justification' in kwargs else ''
        self.institution_admin = self.crop_name(kwargs['institution_admin'], MAXIMUM_USER_NAME)
        self.institution_name = self.crop_name(kwargs['institution_name'], MAXIMUM_INSTITUTION_NAME)
        self.institution_email = self.crop_name(kwargs['institution_email'], MAXIMUM_INSTITUTION_NAME)
        self.institution_key = kwargs['institution_key']

    def send_email(self):
        """It enqueue a sending email task with the json that will fill the entity's html.
        
        For that, it call its super with email_json property.
        """
        email_json = {
            'user_name': self.user_name,
            'user_email': self.user_email,
            'justification': self.justification,
            'institution_admin': self.institution_admin,
            'institution_name': self.institution_name,
            'institution_email': self.institution_email,
            'institution_key': self.institution_key
        }
        super(RemoveMemberEmailSender, self).send_email(email_json)