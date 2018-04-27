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
from .institution_hierarchy_handler import *
from .institution_members_handler import *
from .institution_parent_request_collection_handler import *
from .institution_parent_request_handler import *
from .institution_request_collection_handler import *
from .institution_request_handler import *
from .institution_timeline_handler import *
from .invite_collection_handler import *
from .invite_handler import *
from .invite_institution_handler import *
from .invite_user_adm_handler import *
from .like_handler import *
from .login_logout_handler import *
from .post_collection_handler import *
from .post_comment_handler import *
from .post_handler import *
from .reply_comment_handler import *
from .request_handler import *
from .resend_invite_handler import *
from .search_handler import *
from .subscribe_post_handler import *
from .user_handler import *
from .user_institutions_handler import *
from .user_profile_handler import *
from .user_request_collection_handler import *
from .user_timeline_handler import *
from .vote_handler import *

__all__ = []

__all__ += base_handler.__all__
__all__ += erro_handler.__all__
__all__ += event_collection_handler.__all__
__all__ += event_handler.__all__
__all__ += get_key_handler.__all__
__all__ += institution_children_request_collection_handler.__all__
__all__ += institution_children_request_handler.__all__
__all__ += institution_collection_handler.__all__
__all__ += institution_events_handler.__all__
__all__ += institution_followers_handler.__all__
__all__ += institution_handler.__all__
__all__ += institution_hierarchy_handler.__all__
__all__ += institution_members_handler.__all__
__all__ += institution_parent_request_collection_handler.__all__
__all__ += institution_parent_request_handler.__all__
__all__ += institution_request_collection_handler.__all__
__all__ += institution_request_handler.__all__
__all__ += institution_timeline_handler.__all__
__all__ += invite_collection_handler.__all__
__all__ += invite_handler.__all__
__all__ += invite_institution_handler.__all__
__all__ += invite_user_adm_handler.__all__
__all__ += like_handler.__all__
__all__ += login_logout_handler.__all__
__all__ += post_collection_handler.__all__
__all__ += post_comment_handler.__all__
__all__ += post_handler.__all__
__all__ += reply_comment_handler.__all__
__all__ += request_handler.__all__
__all__ += resend_invite_handler.__all__
__all__ += search_handler.__all__
__all__ += subscribe_post_handler.__all__
__all__ += user_handler.__all__
__all__ += user_institutions_handler.__all__
__all__ += user_profile_handler.__all__
__all__ += user_request_collection_handler.__all__
__all__ += user_timeline_handler.__all__
__all__ += vote_handler.__all__
