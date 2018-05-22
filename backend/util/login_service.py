
"""Service to manage user authentication."""

import json
from google.appengine.ext import ndb
from utils import verify_token
from models import User

__all__ = ['login_required']

def setup_current_institution(user, request):
    """
    Current institution is used by the backend to specify which
    institution the user is logged. The HTTP header Institution-Authorization,
    if exist, comes with the institution key that provides the direct
    access to the resource. Once the header exists, it creates a user
    property 'current_institution' with a ndb.Key to be used during 
    the transaction.
    """
    try:
        institution_header = request.headers['Institution-Authorization']
        institution_key = ndb.Key(urlsafe=institution_header)
        user.current_institution = institution_key
    except KeyError as error:
        user.current_institution = None

def login_required(method):
    """Handle required login."""
    def login(self, *args):
        credential = verify_token(self.request)
        if not credential:
            self.response.write(json.dumps({
                'msg': 'Auth needed',
                'login_url': 'http://%s/#/signin' % self.request.host
            }))
            self.response.set_status(401)
            return

        user_name = credential.get('name', 'Unknown')
        user_email = credential.get('email', 'Unknown')
        user = User.get_by_email(user_email)

        if user is None:
            user = User()
            user.name = user_name
            user.email = [user_email]

        setup_current_institution(user, self.request)

        method(self, user, *args)
    return login
