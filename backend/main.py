# -*- coding: utf-8 -*-
"""Main."""

import webapp2

from handlers import InstitutionHandler
from handlers import InstitutionMembersHandler
from handlers import InstitutionFollowersHandler
from handlers import InstitutionCollectionHandler
from handlers import LoginHandler
from handlers import LogoutHandler
from handlers import UserHandler
from handlers import UserProfileHandler
from handlers import UserInstitutionsHandler
from handlers import PostCollectionHandler
from handlers import PostHandler
from handlers import LikeHandler
from handlers import VoteHandler
from handlers import InstitutionTimelineHandler
from handlers import UserTimelineHandler
from handlers import ErroHandler
from handlers import GetKeyHandler
from handlers import PostCommentHandler
from handlers import SubscribePostHandler
from handlers import ReplyCommentHandler
from handlers import SearchHandler
from handlers import InviteUserHandler
from handlers import InviteInstitutionCollectionHandler
from handlers import EventHandler
from handlers import EventCollectionHandler
from handlers import UserRequestCollectionHandler
from handlers import InstitutionParentRequestCollectionHandler
from handlers import InstitutionChildrenRequestCollectionHandler
from handlers import InstitutionRequestCollectionHandler
from handlers import InstitutionRequestHandler
from handlers import InstitutionParentRequestHandler
from handlers import InstitutionChildrenRequestHandler
from handlers import InstitutionHierarchyHandler
from handlers import RequestHandler
from handlers import InstitutionEventsHandler
from handlers import ResendInviteHandler
from handlers import InviteUserAdmHandler
from handlers import InviteHierarchyCollectionHandler
from handlers import InviteUserCollectionHandler
from handlers import InviteInstitutionHandler
from handlers import InviteHandler
from handlers import InstitutionParentHandler

methods = set(webapp2.WSGIApplication.allowed_methods)
methods.add('PATCH')
webapp2.WSGIApplication.allowed_methods = frozenset(methods)

app = webapp2.WSGIApplication([
    ("/api/requests/(.*)/user", RequestHandler),
    ("/api/invites/institution_hierarchy", InviteHierarchyCollectionHandler),
    ("/api/invites/user", InviteUserCollectionHandler),
    ("/api/invites/institution", InviteInstitutionCollectionHandler),
    ("/api/invites/(.*)/resend", ResendInviteHandler),
    ("/api/invites/(.*)/institution_adm", InviteUserAdmHandler),
    ("/api/invites/institution/(.*)", InviteInstitutionHandler),
    ("/api/invites/user/(.*)", InviteUserHandler),
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
    ("/api/institutions/(.*)/events", InstitutionEventsHandler),
    ("/api/institutions/(.*)/hierarchy/(.*)", InstitutionHierarchyHandler),
    ("/api/institutions/(.*)/invites/(.*)", InstitutionHandler),
    ("/api/institutions/(.*)/requests/user", UserRequestCollectionHandler),
    ("/api/institutions/requests/institution/(.*)", InstitutionRequestCollectionHandler),
    ("/api/institutions/(.*)/requests/institution_parent", InstitutionParentRequestCollectionHandler),
    ("/api/institutions/(.*)/requests/institution_children", InstitutionChildrenRequestCollectionHandler),
    ("/api/institutions/(.*)/institution_parent", InstitutionParentHandler),
    ("/api/institutions/(.*)", InstitutionHandler),
    ("/api/key/(.*)", GetKeyHandler),
    ("/api/posts/(.*)/comments/(.*)/replies", ReplyCommentHandler),
    ("/api/posts/(.*)/comments/(.*)/replies/(.*)/likes", LikeHandler),
    ("/api/posts/(.*)/comments/(.*)/replies/(.*)", ReplyCommentHandler),
    ("/api/posts/(.*)/comments/(.*)/likes", LikeHandler),
    ("/api/posts/(.*)/comments", PostCommentHandler),
    ("/api/posts/(.*)/comments/(.*)", PostCommentHandler),
    ("/api/posts/(.*)/likes", LikeHandler),
    ("/api/posts/(.*)/subscribers", SubscribePostHandler),
    ("/api/posts/(.*)", PostHandler),
    ("/api/posts", PostCollectionHandler),
    ("/api/surveyposts/(.*)/votes", VoteHandler),
    ("/api/user", UserHandler),
    ("/api/user/(.*)/profile", UserProfileHandler),
    ("/api/user/institutions/(.*)/institutional-operations", UserInstitutionsHandler),
    ("/api/user/institutions/(.*)", UserHandler),
    ("/api/user/timeline.*", UserTimelineHandler),
    ("/api/search/institution", SearchHandler),
    ("/login", LoginHandler),
    ("/logout", LogoutHandler),
    ("/api/.*", ErroHandler)
], debug=True)
