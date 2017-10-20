# -*- coding: utf-8 -*-
"""User Timeline Handler."""

from google.appengine.ext import ndb
import json

from utils import login_required
from utils import json_response
from utils import offset_pagination
from utils import Utils
from utils import to_int

from handlers.base_handler import BaseHandler
from models.post import Post


class InstitutionTimelineHandler(BaseHandler):
    """Get posts of specific institution."""

    @json_response
    @login_required
    def get(self, user, url_string):
        """Handler of get posts."""
        page = self.request.get('page', Utils.DEFAULT_PAGINATION_OFFSET)
        limit = self.request.get('limit', Utils.DEFAULT_PAGINATION_LIMIT)

        page = to_int(page, "Query param page muste be integer")
        limit = to_int(limit, "Query param limit muste be integer")

        institution_key = ndb.Key(urlsafe=url_string)
        queryPosts = Post.query(Post.institution == institution_key).order(
            -Post.last_modified_date)

        queryPosts, more = offset_pagination(
            page,
            limit,
            queryPosts)

        array = [Post.make(post, self.request.host) for post in queryPosts]

        data = {
            'posts': array,
            'next': more
        }

        self.response.write(json.dumps(data))
