"""Accepted institution email sender model."""

from email_sender import EmailSender


class AcceptedInstitutionEmailSender(EmailSender):
    """Entity responsible for send accepted institution email."""

    def __init__(self, **kwargs):
        """The class constructor.

        It initializes the object with its html and its specific properties.
        crop_institution_name is called to make sure that the names don't exceed the maximum allowed size.
        """
        super(AcceptedInstitutionEmailSender, self).__init__(**kwargs)
        self.html = 'accepted_institution.html'
        self.institution_key = kwargs['institution_key']

    def send_email(self):
        """It enqueue a sending email task with the json that will fill the entity's html.
        
        For that, it call its super with email_json property.
        """
        email_json = {
            'institution_key': self.institution_key
        }
        super(AcceptedInstitutionEmailSender, self).send_email(email_json)
