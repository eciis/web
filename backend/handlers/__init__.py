"""Initialize handlers module."""

from .base_handler import *
from .erro_handler import *
from .event_collection_handler import *
from .event_handler import *
from .get_key_handler import *
from .institution_children_request_collection_handler import *
from .institution_children_request_handler import *
from .institution_collection_handler import *
from .institution_events_handler import *
from .institution_followers_handler import *
from .institution_handler import *
from .institution_members_handler import *
from .institution_parent_request_collection_handler import *
from .institution_parent_request_handler import *
from .institution_request_collection_handler import *
from .institution_request_handler import *
from .institution_timeline_handler import *
from .invite_handler import *
from .invite_institution_collection_handler import *
from .invite_user_adm_handler import *
from .like_handler import *
from .login_logout_handler import *
from .post_collection_handler import *
from .post_comment_handler import *
from .post_handler import *
from .reply_comment_handler import *
from .user_request_handler import *
from .resend_invite_handler import *
from .search_handler import *
from .subscribe_post_handler import *
from .user_handler import *
from .user_institutions_handler import *
from .user_profile_handler import *
from .user_request_collection_handler import *
from .user_timeline_handler import *
from .vote_handler import *
from .invite_hierarchy_collection_handler import *
from .invite_user_collection_handler import *
from .invite_institution_handler import *
from .invite_user_handler import *
from .institution_parent_handler import *
from .institution_children_handler import *
from .event_followers_handler import *
from .feature_toggle_handler import *

handlers = [
    base_handler, erro_handler, event_collection_handler, event_handler,
    get_key_handler, institution_children_request_collection_handler,
    institution_children_request_handler, institution_collection_handler,
    institution_events_handler, institution_followers_handler,
    institution_handler,institution_members_handler, 
    institution_parent_request_collection_handler,
    institution_parent_request_handler, institution_request_collection_handler,
    institution_request_handler, institution_timeline_handler,
    invite_handler, invite_institution_collection_handler,
    invite_user_adm_handler, like_handler, login_logout_handler,
    post_collection_handler, post_comment_handler, post_handler,
    reply_comment_handler, user_request_handler, resend_invite_handler,
    search_handler, subscribe_post_handler, user_handler,
    user_institutions_handler, user_profile_handler,
    user_request_collection_handler, user_timeline_handler, vote_handler,
    invite_hierarchy_collection_handler, invite_user_collection_handler,
    invite_institution_handler, invite_user_handler, institution_parent_handler,
    institution_children_handler, event_followers_handler, feature_toggle_handler
]

__all__ = [prop for handler in handlers for prop in handler.__all__]
