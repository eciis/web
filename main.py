# -*- coding: utf-8 -*-
"""Main."""

import webapp2

from handlers.main import MainHandler
from handlers.institution import InstitutionHandler
from handlers.login_logout import LoginHandler
from handlers.login_logout import LogoutHandler
from handlers.user import UserHandler
from handlers.post import PostHandler
from handlers.userTimeline import UserTimelineHandler
from handlers.erro import ErroHandler
from handlers.getKey import GetKeyHandler


app = webapp2.WSGIApplication([
    ("/api", MainHandler),
    ("/api/institution/(.*)", InstitutionHandler),
    ("/api/key/(.*)", GetKeyHandler),
    ("/api/post", PostHandler),
    ("/api/user", UserHandler),
    ("/api/user/timeline", UserTimelineHandler),
    ("/login", LoginHandler),
    ("/logout", LogoutHandler),
    ("/api/.*", ErroHandler),
], debug=True)
