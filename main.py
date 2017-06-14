# -*- coding: utf-8 -*-
"""Main."""

import webapp2

from handlers.main_handler import MainHandler
from handlers.institution_handler import InstitutionHandler
from handlers.institution_members_handler import InstitutionMembersHandler
from handlers.institution_followers_handler import InstitutionFollowersHandler
from handlers.institution_collection_handler import InstitutionCollectionHandler
from handlers.login_logout_handler import LoginHandler
from handlers.login_logout_handler import LogoutHandler
from handlers.user_handler import UserHandler
from handlers.post_collection_handler import PostCollectionHandler
from handlers.post_handler import PostHandler
from handlers.institution_timeline_handler import InstitutionTimelineHandler
from handlers.user_timeline_handler import UserTimelineHandler
from handlers.erro_handler import ErroHandler
from handlers.get_key_handler import GetKeyHandler
from handlers.post_comment_handler import PostCommentHandler
from handlers.image_handler import ImageHandler

methods = set(webapp2.WSGIApplication.allowed_methods)
methods.add('PATCH')
webapp2.WSGIApplication.allowed_methods = frozenset(methods)

app = webapp2.WSGIApplication([
    ("/api", MainHandler),
    ("/api/images", ImageHandler),
    ("/api/images/(.*)", ImageHandler),
    ("/api/institution", InstitutionCollectionHandler),
    ("/api/institution/(.*)/timeline", InstitutionTimelineHandler),
    ("/api/institution/(.*)/members", InstitutionMembersHandler),
    ("/api/institution/(.*)/followers", InstitutionFollowersHandler),
    ("/api/institution/(.*)", InstitutionHandler),
    ("/api/key/(.*)", GetKeyHandler),
    ("/api/post/(.*)/comment/(.*)", PostCommentHandler),
    ("/api/post/(.*)/comment", PostCommentHandler),
    ("/api/post/(.*)/like", PostHandler),
    ("/api/post/(.*)", PostHandler),
    ("/api/post", PostCollectionHandler),
    ("/api/user", UserHandler),
    ("/api/user/timeline", UserTimelineHandler),
    ("/login", LoginHandler),
    ("/logout", LogoutHandler),
    ("/api/.*", ErroHandler),
], debug=True)
