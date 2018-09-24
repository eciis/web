"""Comment Push Notification."""


class CommentPushNotification(object):

    def __init__(self, **kwargs):
        self.entity = kwargs['entity_key']
    
    def get_props(self):
        url = "/posts/%s" %self.entity

        return {
            'title': 'Postagem comentado',
            'body': 'Uma postagem do seu interesse foi comentada',
            'click_action': url
        }
