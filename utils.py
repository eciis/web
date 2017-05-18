# -*- coding: utf-8 -*-
import logging
import json
import datetime

from google.appengine.ext import ndb
from google.appengine.ext.ndb import Key


class Utils():

    STATUS_SUCCESS = 201
    NOT_FOUND = 404

    # Responsável por criar uma instância da classe com os valores dos
    # atributos setados.
    @staticmethod
    def createEntity(EntityClass, propertiesValue):
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
                    """
                    TODO: Change between http and https when local and deployed

                    @author: André Abrantes
                    """
                    return "http://%s/api/get/%s" % (host, entity.urlsafe())
                else:
                    return entity.urlsafe()
        if isinstance(entity, ndb.Model):
            out = entity.to_dict()
            out['iid'] = entity.key.id()
            return Utils.toJson(out, loadkey=loadkey, host=host)
        return entity
