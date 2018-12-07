"""Feature model."""
from google.appengine.ext import ndb

__all__ = ['Feature']

class Feature(ndb.Model):
    name = ndb.StringProperty()
    enabled = ndb.BooleanProperty()
    group = ndb.StringProperty(
        choices=set(["ADMIN", "COMMOM", "ALL"]))

    @staticmethod
    def create(name, enable, group="ALL"):
        feature = Feature(id=name, name=name, enabled=enable, group=group)
        feature.put()
        return feature
    
    @staticmethod
    def enable_all(features_dict):
        features = Feature.query(Feature.name.IN(features_dict.keys())).fetch()
        
        for feature in features:
            feature.enabled = features_dict[feature.name]['enabled']
            feature.group = features_dict[feature.name]['group']

        ndb.put_multi(features)
        return features

    @staticmethod
    def isEnabled(feature_name):
        feature = Feature.get_by_id(feature_name)
        
        if feature:
            return feature.enabled
        else:
            raise Exception("Feature not found!")