"""Invite institution email sender model."""

from . import EmailSender

__all__ = ['InviteInstitutionEmailSender']

MAXIMUM_INSTITUTION_NAME = 29
MAXIMUM_USER_NAME = 26

class InviteInstitutionEmailSender(EmailSender):
    """Entity responsible for send invite institution's email."""

    def __init__(self, **kwargs):
        """The class constructor.

        It initializes the object with its html and its specific properties.
        crop_institution_name is called to make sure that the names don't exceed the maximum allowed size.
        """
        super(InviteInstitutionEmailSender, self).__init__(**kwargs)
        self.html = 'invite_institution_email.html'
        self.inviter = self.crop_name(kwargs['inviter'], MAXIMUM_USER_NAME)
        self.invite_key = kwargs['invite_key']
        self.institution = self.crop_name(kwargs['institution'], MAXIMUM_INSTITUTION_NAME)
        self.invited_institution = self.crop_name(kwargs['invited_institution'], MAXIMUM_INSTITUTION_NAME)

    def send_email(self):
        """It enqueue a sending email task with the json that will fill the entity's html.
        
        For that, it call its super with email_json property.
        """
        email_json = {
            'institution': self.institution,
            'inviter': self.inviter,
            'invited_institution': self.invited_institution,
            'invite_key': self.invite_key
        }
        super(InviteInstitutionEmailSender, self).send_email(email_json)
