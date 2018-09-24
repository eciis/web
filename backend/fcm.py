from pyfcm import FCMNotification

from firebase_config import SERVER_KEY, FIREBASE_URL

from firebase import _get_http

import json

FIREBASE_TOKENS_ENDPOINT = "%s/pushNotifications.json" % FIREBASE_URL

ICON_URL = "https://firebasestorage.googleapis.com/v0/b/eciis-splab.appspot.com/o/images%2FLOGO-E-CIS-1510941864112?alt=media&token=ca197614-ad60-408e-b21e-0ebe258c4a80"

push_service = FCMNotification(api_key=SERVER_KEY)

def notify_single_user(title, body, receiver_key):
    token = get_token(receiver_key)
    if token:
        result = push_service.notify_single_device(
            registration_id=token, message_title=title, 
            message_body=body, message_icon=ICON_URL
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
