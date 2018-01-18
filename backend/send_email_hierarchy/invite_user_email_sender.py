"""Invite user email sender model."""

from email_sender import EmailSender

class InviteUserEmailSender(EmailSender):
    """Entity responsible for send invite user's email."""

    def __init__(self, **kwargs):
        """The class constructor.

        It initializes the object with its html and its specific properties.
        crop_institution_name is called to make sure that the names don't exceed the maximum allowed size.
        """
        super(InviteUserEmailSender, self).__init__(**kwargs)
        self.html = 'invite_user.html'
        self.inviter = kwargs['inviter']
        self.invite_key = kwargs['invite_key']
        self.institution = self.crop_institution_name(kwargs['institution'])

    def send_email(self):
        """It enqueue a sending email task with the json that will fill the entity's html.
        
        For that, it call its super with email_json property.
        """
        email_json = {
            'institution': self.institution, 
            'inviter': self.inviter,
            'invite_key': self.invite_key
        }
        super(InviteUserEmailSender, self).send_email(email_json)
