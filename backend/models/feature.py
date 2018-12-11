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
    def enable_all(features_list):
        features_dict = {
            feature['name']: {
                'enabled': feature['enabled'],
                'group': feature['group']
            } for feature in features_list
        }

        features = Feature.query(Feature.name.IN(features_dict.keys())).fetch()
        
        for feature in features:
            feature.enabled = features_dict[feature.name]['enabled']
            feature.group = features_dict[feature.name]['group']

        ndb.put_multi(features)
        return features

    @staticmethod
    def get_all_features():
        features = Feature.query().fetch()
        return features

    @staticmethod
    def get_feature(feature_name):
        feature = Feature.get_by_id(feature_name)
        
        if feature:
            return feature
        else:
            raise Exception("Feature not found!")

    @staticmethod
    def isEnabled(feature_name):
        feature = Feature.get_feature(feature_name)
        return feature.enabled

    def make(self):
        make_obj = {
            'name': self.name,
            'enabled': self.enabled,
            'group': self.group
        }

        return make_obj
