# -*- coding: utf-8 -*-
"""Main."""

import webapp2

from handlers.main_handler import MainHandler
from handlers.institution_handler import InstitutionHandler
from handlers.institution_follower_handler import InstitutionFollowerHandler
from handlers.institution_collection_handler import InstitutionCollectionHandler
from handlers.login_logout_handler import LoginHandler
from handlers.login_logout_handler import LogoutHandler
from handlers.user_handler import UserHandler
from handlers.post_collection_handler import PostCollectionHandler
from handlers.post_handler import PostHandler
from handlers.user_timeline_handler import UserTimelineHandler
from handlers.erro_handler import ErroHandler
from handlers.get_key_handler import GetKeyHandler

methods = set(webapp2.WSGIApplication.allowed_methods)
methods.add('PATCH')
webapp2.WSGIApplication.allowed_methods = frozenset(methods)

app = webapp2.WSGIApplication([
    ("/api", MainHandler),
    ("/api/institution", InstitutionCollectionHandler),
    ("/api/institution/(.*)/follower", InstitutionFollowerHandler),
    ("/api/institution/(.*)", InstitutionHandler),
    ("/api/key/(.*)", GetKeyHandler),
    ("/api/post", PostCollectionHandler),
    ("/api/post/(.*)/like", PostHandler),
    ("/api/post/(.*)", PostHandler),
    ("/api/user", UserHandler),
    ("/api/user/timeline", UserTimelineHandler),
    ("/login", LoginHandler),
    ("/logout", LogoutHandler),
    ("/api/.*", ErroHandler),
], debug=True)
