# -*- coding: utf-8 -*-
"""User Timeline Handler."""

from google.appengine.ext import ndb
import json

from utils import login_required
from utils import json_response

from handlers.base_handler import BaseHandler
from models.post import Post


class InstitutionTimelineHandler(BaseHandler):
    """Get posts of specific institution."""

    @json_response
    @login_required
    def get(self, user, url_string):
        """TODO: Change to get a timeline without query and paginated.

        @author: Mayza Nunes 15/06/2017
        """
        institution_key = ndb.Key(urlsafe=url_string)
        queryPosts = Post.query(Post.institution == institution_key).order(Post.publication_date)

        array = [Post.make(post, self.request.host) for post in queryPosts]

        self.response.write(json.dumps(array))
