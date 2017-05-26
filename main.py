# -*- coding: utf-8 -*-
"""Main."""

import webapp2

from handlers.main_handler import MainHandler
from handlers.institution_handler import InstitutionHandler
from handlers.login_logout_handler import LoginHandler
from handlers.login_logout_handler import LogoutHandler
from handlers.user_handler import UserHandler
from handlers.post_handler import PostsHandler
from handlers.post_handler import PostHandler
from handlers.user_timeline_handler import UserTimelineHandler
from handlers.erro_handler import ErroHandler
from handlers.get_key_handler import GetKeyHandler


app = webapp2.WSGIApplication([
    ("/api", MainHandler),
    ("/api/institution/(.*)", InstitutionHandler),
    ("/api/key/(.*)", GetKeyHandler),
    ("/api/post", PostsHandler),
    ("/api/post/(.*)", PostHandler),
    ("/api/user", UserHandler),
    ("/api/user/timeline", UserTimelineHandler),
    ("/login", LoginHandler),
    ("/logout", LogoutHandler),
    ("/api/.*", ErroHandler),
], debug=True)
