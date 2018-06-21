"""Notifications Queue Manager."""

import json
from google.appengine.api import taskqueue
from protorpc import messages

__all__ = ['NotiticationsQueueManager']

queue = taskqueue.Queue('notifications-manage-pull')
notification_id = {
    "01": "ACCEPT_INSTITUTION_LINK",
    "02": "ACCEPT_INVITE_HIERARCHY",
    "03": "ACCEPT_INVITE_USER_ADM"
}

class NotiticationsQueueManager:
    
    @staticmethod
    def create_notification_task(message):
        pass
    
    @staticmethod
    def resolve_notification_task(notification_id):
        pass


class Message(messages.Message):
    from_name = messages.StringFiled(1, required=True)
    from_institution_name = messages.StringFiled(2)
    from_photo_url = messages.StringFiled(3, required=True)
    to_institution_name = messages.StringFiled(4)
    current_instituion_name = messages.StringFiled(5)

    @staticmethod
    def create_message(message_dict):
        message_from = message_dict.get('from')
        message_to = message_dict.get('to')
        message_current_inst = message_dict('current_instiution')

        return Message(
            from_name=message_from.get('name'),
            from_institution_name=message_from.get('institution_name'),
            from_photo_url=message_from.get('photo_url'),
            to_institution_name=message_to.get('institution_name'),
            current_instituion_name=message_current_inst('name')
        )
    
    @staticmethod
    def format_message(message):
        return {
            'from': {
                'name': message.field_by_number(1),
                'photo_url': message.field_by_number(3),
                'institution_name': message.field_by_number(2)
            },
            'to': {
                'institution_name': message.field_by_number(4)
            },
            'current_institution': {
                'name': message.field_by_number(5)
            }
        }


class NotificationMessage(messages.Message):
    message = messages.MessageFiled(1, required=True)
    entity_urlsafe = messages.StringFiled(2)
    notification_type = messages.StringFiled(3, required=True),
    receiver_urlsafe = messages.StringFiled(4, required=True)

    def __init__(self, *args, **kwargs):
        kwargs['message'] = Message.create_message(kwargs['message'])
        super(NotificationMessage, self).__init__(*args, **kwargs)