"""."""


class LikePushNotification(object):

    def __init__(self, **kwargs):
        self.entity_key = kwargs['entity_key']
    
    def get_props(self):
        url = '/posts/%s' %self.entity_key

        return {
            'title': 'Postagem curtida',
            'body': 'Uma postagem de seu interesse foi curtida',
            'click_action': url
        }
