# -*- coding: utf-8 -*-
"""User Timeline Handler."""

import json

from utils import login_required
from utils import json_response

from handlers.base_handler import BaseHandler
from models.post import Post


class UserTimelineHandler(BaseHandler):
    """Get posts of all institutions that the user follow."""

    @json_response
    @login_required
    def get(self, user):
        """TODO: Change to get a timeline without query.

        @author: Mayza Nunes 18/05/2017
        """
        array = []

        if len(user.follows) > 0:
            queryPosts = Post.query(Post.institution.IN(
                user.follows)).order(Post.publication_date)
            publishedPosts = queryPosts.filter(Post.state == "published")

            array = [Post.make(post, self.request.host) for post in publishedPosts]

        self.response.write(json.dumps(array))
