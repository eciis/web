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
from handlers.user_profile_handler import UserProfileHandler
from handlers.post_collection_handler import PostCollectionHandler
from handlers.post_handler import PostHandler
from handlers.like_handler import LikeHandler
from handlers.institution_timeline_handler import InstitutionTimelineHandler
from handlers.user_timeline_handler import UserTimelineHandler
from handlers.erro_handler import ErroHandler
from handlers.get_key_handler import GetKeyHandler
from handlers.post_comment_handler import PostCommentHandler
from handlers.post_followers_handler import PostFollowersHandler
from handlers.reply_comment_handler import ReplyCommentHandler
from handlers.invite_collection_handler import InviteCollectionHandler
from handlers.search_handler import SearchHandler
from handlers.invite_handler import InviteHandler
from handlers.invite_institution_handler import InviteInstitutionHandler
from handlers.event_handler import EventHandler
from handlers.event_collection_handler import EventCollectionHandler
from handlers.redirect_handler import AppRedirectHandler
from handlers.user_request_collection_handler import UserRequestCollectionHandler
from handlers.institution_parent_request_collection_handler import InstitutionParentRequestCollectionHandler
from handlers.institution_children_request_collection_handler import InstitutionChildrenRequestCollectionHandler
from handlers.institution_request_collection_handler import InstitutionRequestCollectionHandler
from handlers.institution_request_handler import InstitutionRequestHandler
from handlers.institution_parent_request_handler import InstitutionParentRequestHandler
from handlers.institution_children_request_handler import InstitutionChildrenRequestHandler
from handlers.institution_hierarchy_handler import InstitutionHierarchyHandler
from handlers.request_handler import RequestHandler

methods = set(webapp2.WSGIApplication.allowed_methods)
methods.add('PATCH')
webapp2.WSGIApplication.allowed_methods = frozenset(methods)

app = webapp2.WSGIApplication([
    ("/api/requests/(.*)/user", RequestHandler),
    ("/api/invites", InviteCollectionHandler),
    ("/api/invites/institution", InviteInstitutionHandler),
    ("/api/invites/(.*)", InviteHandler),
    ("/api/requests/(.*)/institution", InstitutionRequestHandler),
    ("/api/requests/(.*)/institution_parent", InstitutionParentRequestHandler),
    ("/api/requests/(.*)/institution_children", InstitutionChildrenRequestHandler),
    ("/api/events/(.*)", EventHandler),
    ("/api/events.*", EventCollectionHandler),
    ("/api/institutions", InstitutionCollectionHandler),
    ("/api/institutions/(.*)/timeline.*", InstitutionTimelineHandler),
    ("/api/institutions/(.*)/members", InstitutionMembersHandler),
    ("/api/institutions/(.*)/followers", InstitutionFollowersHandler),
    ("/api/institutions/(.*)/hierarchy/(.*)", InstitutionHierarchyHandler),
    ("/api/institutions/(.*)/invites/(.*)", InstitutionHandler),
    ("/api/institutions/(.*)/requests/user", UserRequestCollectionHandler),
    ("/api/institutions/requests/institution", InstitutionRequestCollectionHandler),
    ("/api/institutions/(.*)/requests/institution_parent", InstitutionParentRequestCollectionHandler),
    ("/api/institutions/(.*)/requests/institution_children", InstitutionChildrenRequestCollectionHandler),
    ("/api/institutions/(.*)", InstitutionHandler),
    ("/api/key/(.*)", GetKeyHandler),
    ("/api/posts/(.*)/comments/(.*)/replies", ReplyCommentHandler),
    ("/api/posts/(.*)/comments/(.*)/replies/(.*)/likes", LikeHandler),
    ("/api/posts/(.*)/comments/(.*)/replies/(.*)", ReplyCommentHandler),
    ("/api/posts/(.*)/comments/(.*)/likes", LikeHandler),
    ("/api/posts/(.*)/comments", PostCommentHandler),
    ("/api/posts/(.*)/comments/(.*)", PostCommentHandler),
    ("/api/posts/(.*)/likes", LikeHandler),
    ("/api/posts/(.*)/followers", PostFollowersHandler),
    ("/api/posts/(.*)", PostHandler),
    ("/api/posts", PostCollectionHandler),
    ("/api/user", UserHandler),
    ("/api/user/(.*)/profile", UserProfileHandler),
    ("/api/user/institutions/(.*)", UserHandler),
    ("/api/user/timeline.*", UserTimelineHandler),
    ("/api/search/institution", SearchHandler),
    ("/login", LoginHandler),
    ("/logout", LogoutHandler),
    ("/api/.*", ErroHandler)
], debug=True)
