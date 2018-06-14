# -*- coding: utf-8 -*-
"""Utils."""
import json
import datetime
import sys
import logging

from app_version import APP_VERSION

from google.appengine.ext import ndb
from unicodedata import normalize

from oauth2client import client
from oauth2client.crypt import AppIdentityError

from custom_exceptions import NotAuthorizedException
from custom_exceptions import QueryException


class Utils():

    STATUS_SUCCESS = 201
    NOT_FOUND = 404
    FORBIDDEN = 403
    BAD_REQUEST = 400
    DEFAULT_PAGINATION_LIMIT = 10
    DEFAULT_PAGINATION_OFFSET = 0

    @staticmethod
    def getJSONError(status_error, message):
        error = {'status_error': status_error, 'msg': message}
        return json.dumps(error)

    @staticmethod
    def toJson(entity, loadkey=None, host=None):
        if isinstance(entity, list):
            return [Utils.toJson(
                item, loadkey=loadkey, host=host) for item in entity]
        if isinstance(entity, dict):
            out = {}
            for item in entity:
                out[item] = Utils.toJson(
                    entity[item], loadkey=loadkey, host=host)
            return out
        if isinstance(entity, datetime.datetime):
            return entity.isoformat()
        if isinstance(entity, ndb.Key):
            if loadkey:
                entity = entity.get()
                return Utils.toJson(entity, loadkey=loadkey, host=host)
            else:
                if host is not None:
                    # TODO: Change between http and https when deployed
                    # and local
                    # @author: André Abrantes
                    return "http://%s/api/key/%s" % (host, entity.urlsafe())
                else:
                    return entity.urlsafe()
        if isinstance(entity, ndb.Model):
            out = entity.to_dict()
            if (entity.key):
                out['key'] = entity.key.urlsafe()
            return Utils.toJson(out, loadkey=loadkey, host=host)
        return entity

    @staticmethod
    def _assert(condition, msg, exception):
        """Check the condition, if true, raise an generic exception."""
        if condition:
            raise exception(msg)

    @staticmethod
    def getHash(obj):
        """Generate a hash to an object."""
        if type(obj) is not dict:
            obj = obj.to_dict()
        hash_num = hash(tuple(obj.items())) % (sys.maxint)
        return str(hash_num)

# The URL that provides public certificates for verifying ID tokens issued
# by Firebase and the Google APIs infrastructure
_GOOGLE_APIS_CERTS_URL = (
    'https://www.googleapis.com/robot/v1/metadata/x509'
    '/securetoken@system.gserviceaccount.com')


def verify_token(request):
    """Verify Firebase auth."""
    token = request.headers['Authorization']
    if token:
        token = token.split(' ').pop()
        try:
            credential = client.verify_id_token(token, None, cert_uri=_GOOGLE_APIS_CERTS_URL)
            return credential
        except (ValueError, AppIdentityError) as error:
            logging.exception(str(error))
            return None

def json_response(method):
    """Add content type header to the response."""
    def response(self, *args):
        self.response.headers['Access-Control-Allow-Origin'] = '*'
        self.response.headers['Access-Control-Expose-Headers'] = 'APP_VERSION'
        self.response.headers['Access-Control-Allow-Headers'] = 'X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method, Authorization, Institution-Authorization'
        self.response.headers['Access-Control-Allow-Methods'] = 'POST, GET, PUT, DELETE, PATCH'
        self.response.headers['Content-Type'] = 'application/json; charset=utf-8'
        self.response.headers['APP_VERSION'] = APP_VERSION
        method(self, *args)
    return response

def offset_pagination(page, number_fetchs, query):
    """Modify query for get entities using offset pagination."""
    offset = page * number_fetchs

    query, next_cursor, more = query.fetch_page(
        number_fetchs,
        offset=offset)

    return [query, more]


def query_paginated(request_data, query):
    """Paginate queries
    
    Keyword arguments:
    request_data -- The query string params
    query -- The query result of an specific entity
    """
    request_data = dict(request_data)

    page = to_int(
        request_data['page'] if 'page' in request_data.keys(
        ) else Utils.DEFAULT_PAGINATION_OFFSET,
        QueryException,
        "Query param page must be an integer")
    limit = to_int(
        request_data['limit'] if 'limit' in request_data.keys(
        ) else Utils.DEFAULT_PAGINATION_LIMIT,
        QueryException,
        "Query param limit must be an integer")

    more = False
    query, more = offset_pagination(page, limit, query)

    return [query, more]


def to_int(value, exception, message_exception):
    """
    Convert string value to integer.

    Otherwise it generates an exception with the specified message.
    """
    try:
        value = int(value)
    except ValueError:
        raise exception(message_exception)

    return value

def text_normalize(text):
    """
    This method removes all accents and special characters from the passed text 
    using the NFKD normalization of unicode coding (For more information on this 
    normalization go to: https://unicode.org/reports/tr15/). This normalization 
    maps all characters to their similar in normal formal unicode. After 
    normalization, treat all escape characters so they are considered normal 
    characters in the text.

    Arguments:
    text -- Text to normilize
    """
    normal_form_text = normalize('NFKD', unicode(text)).encode('ascii', 'ignore')
    text_ignoring_escape_chars = normal_form_text.encode('unicode-escape')
    return text_ignoring_escape_chars
