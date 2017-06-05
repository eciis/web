# -*- coding: utf-8 -*-
"""Institution Follower Handler."""

from google.appengine.ext import ndb
from utils import login_required
from utils import json_response

from models.institution import Institution

from handlers.base_handler import BaseHandler


class InstitutionFollowerHandler(BaseHandler):
    """Institution Follower Handler."""

    @json_response
    @login_required
    @ndb.transactional(xg=True)
    def post(self, user, url_string):
        """Add or remove follower in the institution."""
        institution_key = ndb.Key(urlsafe=url_string)
        institution = institution_key.get()

        if(not type(institution) is Institution):
            raise Exception("Key is not an Institution")

        action = self.request.url.split('/')[-1]

        if action == 'follow':
            institution.follow(user.key)
            user.follow(institution_key)
        else:
            institution.unfollow(user.key)
            user.unfollow(institution_key)
