# -*- coding: utf-8 -*-
"""Main."""

import webapp2

from handlers.institution_handler import InstitutionHandler
from handlers.institution_members_handler import InstitutionMembersHandler
from handlers.institution_followers_handler import InstitutionFollowersHandler
from handlers.institution_collection_handler import InstitutionCollectionHandler
from handlers.login_logout_handler import LoginHandler
from handlers.login_logout_handler import LogoutHandler
from handlers.user_handler import UserHandler
from handlers.post_collection_handler import PostCollectionHandler
from handlers.post_handler import PostHandler
from handlers.like_post_handler import LikePostHandler
from handlers.institution_timeline_handler import InstitutionTimelineHandler
from handlers.user_timeline_handler import UserTimelineHandler
from handlers.erro_handler import ErroHandler
from handlers.get_key_handler import GetKeyHandler
from handlers.post_comment_handler import PostCommentHandler
from handlers.reply_comment_handler import ReplyCommentHandler
from handlers.invite_collection_handler import InviteCollectionHandler
from handlers.search_handler import SearchHandler
from handlers.invite_handler import InviteHandler
from handlers.event_handler import EventHandler
from handlers.event_collection_handler import EventCollectionHandler
from handlers.redirect_handler import AppRedirectHandler
from handlers.user_request_collection_handler import UserRequestCollectionHandler
from handlers.institution_hierarchy_handler import InstitutionHierarchyHandler
from handlers.request_handler import RequestHandler

methods = set(webapp2.WSGIApplication.allowed_methods)
methods.add('PATCH')
webapp2.WSGIApplication.allowed_methods = frozenset(methods)

app = webapp2.WSGIApplication([
    ("/api/requests/(.*)/user", RequestHandler),
    ("/api/invites", InviteCollectionHandler),
    ("/api/invites/(.*)", InviteHandler),
    ("/api/events", EventCollectionHandler),
    ("/api/events/(.*)", EventHandler),
    ("/api/institutions", InstitutionCollectionHandler),
    ("/api/institutions/(.*)/timeline", InstitutionTimelineHandler),
    ("/api/institutions/(.*)/members", InstitutionMembersHandler),
    ("/api/institutions/(.*)/followers", InstitutionFollowersHandler),
    ("/api/institutions/(.*)/hierarchy/(.*)", InstitutionHierarchyHandler),
    ("/api/institutions/(.*)/invites/(.*)", InstitutionHandler),
    ("/api/institutions/(.*)/requests/user", UserRequestCollectionHandler),
    ("/api/institutions/(.*)", InstitutionHandler),
    ("/api/key/(.*)", GetKeyHandler),
    ("/api/posts/(.*)/comments/(.*)/replies", ReplyCommentHandler),
    ("/api/posts/(.*)/comments/(.*)/replies/(.*)", ReplyCommentHandler),
    ("/api/posts/(.*)/comments", PostCommentHandler),
    ("/api/posts/(.*)/comments/(.*)", PostCommentHandler),
    ("/api/posts/(.*)/likes", LikePostHandler),
    ("/api/posts/(.*)", PostHandler),
    ("/api/posts", PostCollectionHandler),
    ("/api/user", UserHandler),
    ("/api/user/institutions/(.*)", UserHandler),
    ("/api/user/invites/(.*)", UserHandler),
    ("/api/user/timeline", UserTimelineHandler),
    ("/api/search/institution", SearchHandler),
    ("/login", LoginHandler),
    ("/logout", LogoutHandler),
    ("/api/.*", ErroHandler),
    ("/app", AppRedirectHandler),
], debug=True)
