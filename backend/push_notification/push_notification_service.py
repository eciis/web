"""Push Notification Service."""

__all__ = ['get_notification_props']

def get_notification_props(_type, entity):
    notification = NotificationProperties(_type, entity.key.urlsafe())
    return notification.get_props()

class NotificationProperties(object):

    def __init__(self, _type, entity):
        types = {
            'LIKE_POST': self.__get_like_props,
            'COMMENT': self.__get_comment_props,
            'INVITE_MEMBER': self.get_invite_props,
            'LINK': self.get_link_props
        }
        self.entity = entity
        self.notification_method = types[_type] 
        
    def get_props(self):
        return self.notification_method()
 
    def __get_like_props(self):
        url = '/posts/%s' % self.entity

        return {
            'title': 'Postagem curtida',
            'body': 'Uma postagem de seu interesse foi curtida',
            'click_action': url
        }

    def __get_comment_props(self):
        url = "/posts/%s" % self.entity

        return {
            'title': 'Postagem comentada',
            'body': 'Uma postagem do seu interesse foi comentada',
            'click_action': url
        }

    def get_invite_props(self):
        pass

    def get_link_props(self):
        pass
