"""Push Notification Service."""

from . import LikePushNotification
from . import CommentPushNotification
from . import InviteMemberPushNotification
from . import LinkPushNotification


types = {
    'LIKE': LikePushNotification,
    'COMMENT': CommentPushNotification,
    'INVITE_MEMBER': InviteMemberPushNotification,
    'LINK': LinkPushNotification
}

def get_notification_props(_type, entity):
    notification_object = types[_type](**{
        'entity_key': entity.key.urlsafe()
    })

    return notification_object.get_props()