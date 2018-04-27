# -*- coding: utf-8 -*-
"""User Timeline Handler."""

from google.appengine.ext import ndb
import json

from utils import login_required
from utils import json_response
from utils import offset_pagination
from utils import Utils
from utils import to_int
from custom_exceptions.queryException import QueryException

from . import BaseHandler
from models.post import Post

__all__ = ['InstitutionTimelineHandler']

class InstitutionTimelineHandler(BaseHandler):
    """Get posts of specific institution."""

    @json_response
    @login_required
    def get(self, user, url_string):
        """Handler of get posts."""
        page = to_int(
            self.request.get('page', Utils.DEFAULT_PAGINATION_OFFSET),
            QueryException,
            "Query param page must be an integer")
        limit = to_int(
            self.request.get('limit', Utils.DEFAULT_PAGINATION_LIMIT),
            QueryException,
            "Query param limit must be an integer")

        institution_key = ndb.Key(urlsafe=url_string)
        queryPosts = Post.query(Post.institution == institution_key).order(
            -Post.last_modified_date)

        queryPosts, more = offset_pagination(
            page,
            limit,
            queryPosts)

        formated_posts = [post.make(self.request.host) for post in queryPosts]
        visible_posts = [post for post in formated_posts
                             if not Post.is_hidden(post)]

        data = {
            'posts': visible_posts,
            'next': more
        }

        self.response.write(json.dumps(data))
