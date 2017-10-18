# -*- coding: utf-8 -*-
"""User Timeline Handler."""

import json

from utils import login_required
from utils import json_response

from handlers.base_handler import BaseHandler
from models.post import Post


class UserTimelineHandler(BaseHandler):
    """Get posts of all institutions that the user follow."""

    number_fetchs = 3

    @json_response
    @login_required
    def get(self, user):
        """Handler of get posts."""
        page = self.request.get('page', 0)

        try:
            offset = int(page) * UserTimelineHandler.number_fetchs
        except ValueError:
            offset = 0

        array = []
        visible_posts = []

        if len(user.follows) > 0:
            queryPosts = Post.query(Post.institution.IN(
                user.follows)).order(-Post.last_modified_date, Post.key)

            queryPosts, next_cursor, more = queryPosts.fetch_page(
                UserTimelineHandler.number_fetchs,
                offset=offset)

            array = [Post.make(post, self.request.host) for post in queryPosts]
            visible_posts = [post for post in array
                             if not Post.is_hidden(post)]

        data = {
            'posts': visible_posts,
            'next': more
        }

        self.response.write(json.dumps(data))
