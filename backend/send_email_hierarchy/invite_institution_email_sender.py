"""Invite institution email sender model."""

from email_sender import EmailSender


class InviteInstitutionEmailSender(EmailSender):
    """Entity responsible for send invite institution's email."""

    def __init__(self, **kwargs):
        """The class constructor.

        It initializes the object with its html and its specific properties.
        crop_institution_name is called to make sure that the names don't exceed the maximum allowed size.
        """
        super(InviteInstitutionEmailSender, self).__init__(**kwargs)
        self.html = 'invite_institution_email.html'
        self.inviter = kwargs['inviter']
        self.institution = self.crop_institution_name(kwargs['institution'])
        self.invited_institution = self.crop_institution_name(kwargs['invited_institution'])

    def send_email(self):
        """It enqueue a sending email task with the json that will fill the entity's html.
        
        For that, it call its super with email_json property.
        """
        email_json = {
            'institution': self.institution,
            'inviter': self.inviter,
            'invited_institution': self.invited_institution
        }
        super(InviteInstitutionEmailSender, self).send_email(email_json)
