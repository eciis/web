"""Pyfcm is a library to enhance and make it easier the communication
with firebase cloud messaging - fcm - from python."""

from pyfcm import FCMNotification

from firebase_config import SERVER_KEY, FIREBASE_URL

from firebase import _get_http

import json

FIREBASE_TOKENS_ENDPOINT = "%s/pushNotifications.json" % FIREBASE_URL

ICON_URL = "https://firebasestorage.googleapis.com/v0/b/eciis-splab.appspot.com/o/images%2FLOGO-E-CIS-1510941864112?alt=media&token=ca197614-ad60-408e-b21e-0ebe258c4a80"

# Instantiate a fcm service to the application server key
push_service = FCMNotification(api_key=SERVER_KEY)


def notify_single_user(title, body, receiver_key):
    """Notify a single user.

    Args:
        title: A string that represents the notification's title.
        body: The body message of the notification, the information
        you want pass to the user.
        receiver_key: The user's key.urlsafe(). It is the key
        that identifies the user in the firebase's database.

    Returns:
        The result of the send notification request.
    """
    token = get_token(receiver_key)
    if token:
        result = push_service.notify_single_device(
            registration_id=token, message_title=title, 
            message_body=body, message_icon=ICON_URL
        )
        return result

def notify_multiple_users(title, body, user_keys):
    """Notify multiple users.
    This function receives a list of user_keys
    and use it to retrieve the tokens.

    Args:
        title: A string that represents the notification's title.
        body: The body message of the notification, the information
        you want pass to the users.
        user_keys: A list with all users' urlsafe keys that will
        receive the notification.

    Returns:
        The result of the send notification request.
    """
    tokens = get_tokens(user_keys)
    if tokens:
        result = push_service.notify_multiple_devices(
            registration_ids=tokens, message_title=title, message_body=body
        )
        return result

def get_token(user_key):
    """Calls get_tokens_from_firebase() 
    to get all the tokens and then filter them with the user_key
    using the token_filter function.

    Args:
        user_key: The user ndb key.urlsafe().
    
    Returns:
        The user's token or None when the user hasn't
        enabled notifications yet.
    """
    data = get_tokens_from_firebase()
    if not user_key in data.keys():
        return None
    return token_filter(data, user_key)

def get_tokens(user_keys):
    """This function calls get_tokens_from_firebase() 
    to get all the tokens and then filter them with the user_keys
    by looping for the keys and using the token_filter function.

    Args:
        user_keys: The users ndb key.urlsafe().
    
    Returns:
        The users' token or an empty list when None 
        of the users haven't enabled notifications yet.
    """
    data = get_tokens_from_firebase()
    data_keys = data.keys()
    tokens = []
    for key in user_keys:
        if key in data_keys:
            current_token = token_filter(data, key)
            tokens.append(current_token)
    return tokens

def get_tokens_from_firebase():
    """This function only wraps the logic of 
    make a request to firebase to retrieve all 
    the tokens from the database.

    Returns:
        The request's content parsed to json.
    """
    response, content = _get_http().request(FIREBASE_TOKENS_ENDPOINT, method='GET')
    return json.loads(content)
    
def token_filter(data, user_key):
    """Receives all the data retrieved
    from firebase and filter it to get the
    token of the user whose key is user_key.

    Args:
        data: All the data retrieved from firebase.
        user_key: The user ndb key.urlsafe().

    Returns:
        The filtered token.
    """
    token_object = data[user_key]
    token_object = token_object[token_object.keys()[0]]
    return token_object['token']
