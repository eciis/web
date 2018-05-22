# -*- coding: utf-8 -*-
"""Institution Followers Handler."""

from google.appengine.ext import ndb
import json

from util import login_required
from utils import Utils
from utils import json_response

from models import Institution

from custom_exceptions import NotAuthorizedException

from . import BaseHandler

__all__ = ['InstitutionFollowersHandler']

class InstitutionFollowersHandler(BaseHandler):
    """Handle GET and POST followers of specific institution."""

    @json_response
    @login_required
    def get(self, user, url_string):
        """Get followers of specific institution."""
        institution_key = ndb.Key(urlsafe=url_string)
        institution = institution_key.get()

        array = [member.get() for member in institution.followers]
        # TODO: This process is unnecessary,
        # need to optimized
        # @author: Tiago Pereira
        array = [member for member in array if member.state == 'active']

        self.response.write(json.dumps(Utils.toJson(array)))

    @json_response
    @login_required
    @ndb.transactional(xg=True)
    def post(self, user, url_string):
        """Add follower in the institution."""
        institution_key = ndb.Key(urlsafe=url_string)
        institution = institution_key.get()

        Utils._assert(institution.state == 'inactive',
                      "The institution has been deleted", NotAuthorizedException)

        if(not type(institution) is Institution):
            raise Exception("Key is not an Institution")

        institution.follow(user.key)
        user.follow(institution_key)

    @json_response
    @login_required
    @ndb.transactional(xg=True)
    def delete(self, user, url_string):
        """Remove follower in the institution."""
        institution_key = ndb.Key(urlsafe=url_string)
        institution = institution_key.get()

        Utils._assert(institution.state == 'inactive',
                      "The institution has been deleted", NotAuthorizedException)
        
        Utils._assert(institution.name == 'Ministério da Saúde',
                      "The institution can not be unfollowed", NotAuthorizedException)

        Utils._assert(institution.trusted,
                      "The institution can not be unfollowed", NotAuthorizedException)

        if(not type(institution) is Institution):
            raise Exception("Key is not an Institution")

        institution.unfollow(user.key)
        user.unfollow(institution_key)
