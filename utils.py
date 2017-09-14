# -*- coding: utf-8 -*-
"""Utils."""
import json
import datetime
import sys
import logging

from google.appengine.ext import ndb
from google.appengine.ext.ndb import Key

from models.user import User

from oauth2client import client
from oauth2client.crypt import AppIdentityError

from custom_exceptions.notAuthorizedException import NotAuthorizedException


class Utils():

    STATUS_SUCCESS = 201
    NOT_FOUND = 404
    FORBIDDEN = 403
    BAD_REQUEST = 400

    @staticmethod
    def createEntity(EntityClass, propertiesValue):
        """Responsible for creating an instance
        of the class with the values ​​of the attributes set.
        """
        entity = EntityClass()
        keys = entity._to_dict().keys()  # _to_dict operação do ndb.Model

        for key in keys:
            value = propertiesValue.get(key)
            attribute = getattr(EntityClass, key)

            if value and isinstance(attribute, ndb.IntegerProperty):
                value = int(value)
            elif value and isinstance(attribute, ndb.KeyProperty):
                kind = attribute.__dict__['_kind']
                value = Key(kind, int(value))
            elif value and isinstance(attribute, ndb.DateTimeProperty):
                value = datetime.datetime.strptime(
                    value, "%Y-%m-%dT%H:%M:%S.%f")
            setattr(entity, key, value)
        return entity

    @staticmethod
    def getAll(EntityClass, response, loadkey=None, query=None):
        if query:
            queryResult = EntityClass.query(query)
        else:
            queryResult = EntityClass.query()
        dataResponse = [Utils.toJson(entity, loadkey=loadkey)
                        for entity in queryResult]
        response.headers[
            'Content-Type'] = 'application/json; charset=utf-8'
        response.write(json.dumps(dataResponse))

    @staticmethod
    def get(EntityClass, iid, response):
        entity = EntityClass.get_by_id(iid)
        response.headers[
            'Content-Type'] = 'application/json; charset=utf-8'
        if entity:
            dataResponse = Utils.toJson(entity, loadkey=True)
            response.write(json.dumps(dataResponse))
        else:
            response.set_status(Utils.NOT_FOUND)
            entityName = EntityClass.__name__
            response.write(Utils.getJSONError(
                Utils.NOT_FOUND, "%s not found!" % entityName))

    @staticmethod
    def postEntity(EntityClass, request, response):
        body = json.loads(request.body)
        entity = Utils.createEntity(EntityClass, body)
        entity.put()

        response.set_status(Utils.STATUS_SUCCESS)
        response.write(json.dumps(Utils.toJson(entity)))

        return entity

    @staticmethod
    def getJSONError(status_error, message):
        error = {'status_error': status_error, 'message': message}
        return json.dumps(error)

    @staticmethod
    def deleteEntity(EntityClass, iid):
        entity = EntityClass.get_by_id(iid)
        if entity:
            entity.key.delete()
        return entity

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


def login_required(method):
    """Handle required login."""
    def login(self, *args):
        credential = verify_token(self.request)
        if not credential:
            self.response.write(json.dumps({
                'msg': 'Auth needed',
                'login_url': 'http://%s/#/signin' % self.request.host
            }))
            self.response.set_status(401)
            return

        user_email = credential.get('email', 'Unknown')
        user = User.get_by_email(user_email)

        method(self, user, *args)
    return login


def create_user(user_name, user_email):
    """Create user."""
    user = User()
    user.email = user_email
    user.name = user_name
    user.photo_url = "/images/avatar.jpg"
    user.put()

    return user


def json_response(method):
    """Add content type header to the response."""
    def response(self, *args):
        self.response.headers[
            'Content-Type'] = 'application/json; charset=utf-8'
        method(self, *args)
    return response


def is_institution_member(method):
    """Check if user passed as parameter is member of an institution."""
    def check_members(self, user, *args):
        data = json.loads(self.request.body)
        institution_key = ndb.Key(urlsafe=data['institution'])
        institution = institution_key.get()

        if user.key in institution.members:
            method(self, user, institution, *args)
        else:
            self.response.set_status(Utils.FORBIDDEN)
            self.response.write(Utils.getJSONError(
                Utils.FORBIDDEN, "User is not a member of this Institution"))
    return check_members


def is_authorized(method):
    """Check if the user is the author of the post or admin of institution."""
    def check_authorization(self, user, url_string, *args):
        obj_key = ndb.Key(urlsafe=url_string)
        post = obj_key.get()
        institution = post.institution.get()
        Utils._assert(not post or not institution,
                      'Post or institution is invalid', Exception)
        Utils._assert(post.author != user.key and
                      institution.admin != user.key,
                      'User is not allowed to remove this post',
                      NotAuthorizedException)

        method(self, user, url_string, *args)
    return check_authorization
