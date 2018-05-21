# -*- coding: utf-8 -*-
"""User Timeline Handler."""

import json

from util import login_required
from utils import json_response
from utils import offset_pagination
from utils import to_int
from utils import Utils
from custom_exceptions.queryException import QueryException

from . import BaseHandler
from models import Post

__all__ = ['UserTimelineHandler']

class UserTimelineHandler(BaseHandler):
    """Get posts of all institutions that the user follow."""

    @json_response
    @login_required
    def get(self, user):
        """Handler of get posts."""
        page = to_int(
            self.request.get('page', Utils.DEFAULT_PAGINATION_OFFSET),
            QueryException,
            "Query param page must be an integer")
        limit = to_int(
            self.request.get('limit', Utils.DEFAULT_PAGINATION_LIMIT),
            QueryException,
            "Query param limit must be an integer")

        array = []
        visible_posts = []

        if len(user.follows) > 0:
            queryPosts = Post.query(Post.institution.IN(
                user.follows)).order(-Post.last_modified_date, Post.key)

            queryPosts, more = offset_pagination(
                page,
                limit,
                queryPosts)

            array = [post.make(self.request.host) for post in queryPosts]
            visible_posts = [post for post in array
                             if not Post.is_hidden(post)]

        data = {
            'posts': visible_posts,
            'next': more
        }

        self.response.write(json.dumps(data))
