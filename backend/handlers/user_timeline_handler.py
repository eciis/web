# -*- coding: utf-8 -*-
"""User Timeline Handler."""

import json
from google.appengine.ext import ndb

from utils import login_required
from utils import json_response

from handlers.base_handler import BaseHandler
from models.post import Post


class UserTimelineHandler(BaseHandler):
    """Get posts of all institutions that the user follow."""

    offset = 0
    number_fetchs = 3

    @json_response
    @login_required
    def get(self, user):
        """Handler of get posts."""
        array = []
        visible_posts = []

        offset = UserTimelineHandler.offset

        if len(user.follows) > 0:
            queryPosts = Post.query(Post.institution.IN(
                user.follows)).order(-Post.last_modified_date, Post.key)

            queryPosts, next_cursor, more = queryPosts.fetch_page(
                UserTimelineHandler.number_fetchs,
                offset=offset)

            array = [Post.make(post, self.request.host) for post in queryPosts]
            visible_posts = [post for post in array
                             if not Post.is_hidden(post)]

        next_offset = ''
        if more:
            UserTimelineHandler.offset = UserTimelineHandler.offset + UserTimelineHandler.number_fetchs
            next_offset = UserTimelineHandler.offset + UserTimelineHandler.number_fetchs

        data = {
            'posts': visible_posts,
            'next': more,
            'next_offset': next_offset
        }

        print data

        self.response.write(json.dumps(visible_posts))
