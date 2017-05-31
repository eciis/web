# -*- coding: utf-8 -*-
import json
import datetime

from google.appengine.api import users
from google.appengine.ext import ndb
from google.appengine.ext.ndb import Key

from models.user import User
from models.institution import Institution


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
    def getJSONError(status_error, mensage):
        error = {'status_error': status_error, 'mensage': mensage}
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
            out['key'] = entity.key.urlsafe()
            return Utils.toJson(out, loadkey=loadkey, host=host)
        return entity


def login_required(method):
    """Handle required login."""
    def login(self, *args):
        current_user = users.get_current_user()
        if current_user is None:
            self.response.write(json.dumps({
                'msg': 'Auth needed',
                'login_url': 'http://%s/login' % self.request.host
            }))
            self.response.set_status(401)
            return
        user = User.get_by_email(current_user.email())
        if user is None:
            user = User()
            user.email = current_user.email()
            user.name = current_user.nickname()

            splab = Institution.query(Institution.name == "SPLAB").get()

            user.institutions = [splab.key]
            user.follows = [splab.key]

            user.put()

            splab.members.append(user.key)

            splab.put()
            # TODO:
            # Return this block of code when user sign up is created
            # @author André L. Abrantes - 25-05-2017
            #
            # self.response.write(json.dumps({
            #     'msg': 'Forbidden',
            #     'login_url': 'http://%s/login' % self.request.host
            # }))
            # self.response.set_status(403)
            # self.redirect("/logout")
            # return
        method(self, user, *args)
    return login


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
    """Check if the user is the author of the post."""
    def check_authorization(self, user, key, *args):
        obj_key = ndb.Key(urlsafe=key)
        post = obj_key.get()
        institution = post.institution.get()
        if not post or not institution:
            raise Exception('Post or institution is invalid')
        if user.key not in institution.members:
            raise Exception('User is not a member of this institution')
        if not post.author == user.key:
            if not institution.admin == user.key:
                raise Exception('User is not allowed to remove this post')
        else:
            method(self, user, key, *args)
    return check_authorization
