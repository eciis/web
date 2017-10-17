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

    cursor = None
    number_fetchs = 12

    @json_response
    @login_required
    def get(self, user):
        """TODO: Change to get a timeline without query.

        @author: Mayza Nunes 18/05/2017
        """
        array = []
        visible_posts = []

        cursor = None
        if UserTimelineHandler.cursor:
            cursor = ndb.Cursor.from_websafe_string(UserTimelineHandler.cursor)

        if len(user.follows) > 0:
            queryPosts = Post.query(Post.institution.IN(
                user.follows)).order(-Post.last_modified_date, Post.key)

            queryPosts, next_cursor, more = queryPosts.fetch_page(
                UserTimelineHandler.number_fetchs,
                start_cursor=cursor)

            array = [Post.make(post, self.request.host) for post in queryPosts]
            visible_posts = [post for post in array
                             if not Post.is_hidden(post)]

        if more:
            UserTimelineHandler.cursor = next_cursor.to_websafe_string()

        self.response.write(json.dumps(visible_posts))
