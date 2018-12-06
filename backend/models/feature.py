"""Feature model."""
from google.appengine.ext import ndb

__all__ = ['Feature']

class Feature(ndb.Model):
    name = ndb.StringProperty()
    enabled = ndb.BooleanProperty()

    @staticmethod
    def create(name, enable):
        feature = Feature(id=name, name=name, enabled=enable)
        feature.put()
        return feature
    
    @staticmethod
    def enable(feature_name, enabled):
        feature = Feature.get_by_id(feature_name)
        
        if feature:
            feature.enabled = enabled
            feature.put()
            return feature
        else:
            raise Exception("Feature not found!")

    @staticmethod
    def isEnabled(feature_name):
        feature = Feature.get_by_id(feature_name)
        
        if feature:
            return feature.enabled
        else:
            raise Exception("Feature not found!")