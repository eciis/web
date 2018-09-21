from pyfcm import FCMNotification

from firebase_config import SERVER_KEY, FIREBASE_URL

from firebase import _get_http

import json

FIREBASE_TOKENS_ENDPOINT = "%s/pushNotifications.json" % FIREBASE_URL

push_service = FCMNotification(api_key=SERVER_KEY)

def notify_single_user(title, body, receiver_key):
    icon = "app/images/icons/cis-64x64.png"
    token = get_token(receiver_key)
    if token:
        result = push_service.notify_single_device(
            registration_id=token, message_title=title, 
            message_body=body, message_icon=icon
        )
        return result

def notify_multiple_users(tokens, title, body):
    result = push_service.notify_multiple_devices(
        registration_ids=tokens, message_title=title, message_body=body
    )
    return result

def get_token(user_key):
    response, content = _get_http().request(FIREBASE_TOKENS_ENDPOINT, method='GET')
    data = json.loads(content)
    if not user_key in data.keys():
        return None
    return token_filter(data, user_key)
    
def token_filter(data, user_key):
    token_object = data[user_key]
    token_object = token_object[token_object.keys()[0]]
    return token_object['token']
