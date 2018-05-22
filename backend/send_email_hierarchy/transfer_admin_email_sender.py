"""Transfer admin email sender model."""

from . import EmailSender

__all__ = ['TransferAdminEmailSender']

MAXIMUM_INSTITUTION_NAME = 29


class TransferAdminEmailSender(EmailSender):
    """Entity responsible for send Transfer admin email."""

    def __init__(self, **kwargs):
        """The class constructor.

        It initializes the object with its html and its specific properties.
        crop_institution_name is called to make sure that the names don't exceed the maximum allowed size.
        """
        super(TransferAdminEmailSender, self).__init__(**kwargs)
        self.html = 'transfer_admin_email.html'
        self.adm_name = self.split_name(kwargs['adm_name'])
        self.institution_name = self.crop_name(kwargs['institution_name'], MAXIMUM_INSTITUTION_NAME)
        self.institution_email = self.crop_name(kwargs['institution_email'], MAXIMUM_INSTITUTION_NAME)

    def send_email(self):
        """It enqueue a sending email task with the json that will fill the entity's html.
        
        For that, it call its super with email_json property.
        """
        email_json = {
            'adm_name': self.adm_name,
            'institution_name': self.institution_name,
            'institution_email': self.institution_email
        }
        super(TransferAdminEmailSender, self).send_email(email_json)
    
    def split_name(self, name):
        """Take the first word in name."""
        return name.split(" ")[0]
