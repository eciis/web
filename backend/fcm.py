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


def notify_single_user(data, user_key):
    """Notify a single user.
    It sends a notification to each user's device.

    Args:
        title: A string that represents the notification's title.
        body: The body message of the notification, the information
        you want pass to the users.
        user_key: user's urlsafe key.
    """
    tokens = get_single_user_tokens(user_key)
    send_push_notifications(data, tokens)


def notify_multiple_users(data, user_keys):
    """Notify multiple users.
    This function receives a list of user_keys
    and use it to retrieve the tokens.

    Args:
        title: A string that represents the notification's title.
        body: The body message of the notification, the information
        you want pass to the users.
        user_keys: A list with all users' urlsafe keys that will
        receive the notification.
    """
    tokens = get_multiple_user_tokens(user_keys)
    send_push_notifications(data, tokens)


def send_push_notifications(data, tokens):
    """It wraps the call to pyfcm notify function.
    
    Args:
        title: A string that represents the notification's title.
        body: The body message of the notification, the information
        you want pass to the users.
        tokens: The devices' tokens that will receive
        the notification.
    """
    title = data['title']
    body = data['body']
    click_action = data['click_action']
    if tokens:
        result = push_service.notify_multiple_devices(
            registration_ids=tokens, message_title=title,
            message_body=body, message_icon=ICON_URL, 
            click_action=click_action
        )
        return result


def get_single_user_tokens(user_key):
    """Calls get_tokens_from_firebase() 
    to get all the tokens and then filter them.

    Args:
        user_key: The user ndb key.urlsafe().
    
    Returns:
        The user's tokens or an empty list when the user hasn't
        enabled notifications yet.
    """
    data = get_tokens_from_firebase(user_key)
    tokens = filter_single_user_tokens(data)
    return tokens


def get_multiple_user_tokens(users_keys):
    """This function calls get_all_tokens_from_firebase() 
    to get all the tokens and then filter them using
    filter_multiple_user_tokens function.

    Args:
        users_keys: The users ndb key.urlsafe().
    
    Returns:
        The users' token or an empty list when None 
        of the users haven't enabled notifications yet.
    """
    data = get_all_tokens_from_firebase()
    tokens = filter_multiple_user_tokens(data, users_keys)
    return tokens


def get_all_tokens_from_firebase():
    """This function only wraps the logic of 
    make a request to firebase to retrieve all 
    the tokens from the database.

    Returns:
        The request's content parsed to json.
    """
    response, content = _get_http().request(FIREBASE_TOKENS_ENDPOINT, method='GET')
    return json.loads(content)


def get_tokens_from_firebase(user_key):
    """It gets all tokens from the firebase 
    of the user whose key is user_key received as parameter.

    Args:
        user_key: The user's urlsafe key.
    
    Returns:
        The request's content parsed to json.
    """
    firebase_endpoint = "%s/pushNotifications/%s.json" %(FIREBASE_URL, user_key)
    response, content = _get_http().request(firebase_endpoint, method='GET')
    return json.loads(content)


def filter_single_user_tokens(content):
    """It loops through the content keys
    and for each object it appends the 
    token property to the token's list.

    Args:
        content: A json returned from firebase.
    
    Returns:
        The user's tokens.
    """
    tokens = []
    for key in content:
        tokens.append(content[key]['token'])
    return tokens


def filter_multiple_user_tokens(content, users_keys):
    """For each user, represented by user_key
    It get the user's firebase objects and loops through
    each object getting the token.

    Args:
        content: The json returned from firebase
        users_keys: The users' keys who will receive the
        notification. 
    
    Returns:
        The users' tokens.
    """
    tokens = []
    for user_key in users_keys:
        if user_key in content:
            current_firebase_objects = content[user_key]
            current_tokens = filter_single_user_tokens(current_firebase_objects)
            map(lambda token: tokens.append(token), current_tokens)
    return tokens
