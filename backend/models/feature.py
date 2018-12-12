"""Feature model."""
from google.appengine.ext import ndb

__all__ = ['Feature']

class Feature(ndb.Model):
    name = ndb.StringProperty()
    enable_mobile = ndb.StringProperty(
        choices=set(["SUPER_USER", "ADMIN", "ALL", "DISABLED"]))
    enable_desktop = ndb.StringProperty(
        choices=set(["SUPER_USER", "ADMIN", "ALL", "DISABLED"]))

    @staticmethod
    def create(name, enable_mobile="ALL", enable_desktop="ALL"):
        feature = Feature(id=name, name=name, enable_desktop=enable_desktop, enable_mobile=enable_mobile)
        feature.put()
        return feature
    
    @staticmethod
    def enable_all(features_list):
        features_dict = {
            feature['name']: {
                'enable_mobile': feature['enable_mobile'],
                'enable_desktop': feature['enable_desktop']
            } for feature in features_list
        }

        features = Feature.query(Feature.name.IN(features_dict.keys())).fetch()
        
        for feature in features:
            feature.enable_desktop = features_dict[feature.name]['enable_desktop']
            feature.enable_mobile = features_dict[feature.name]['enable_mobile']

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
            'enable_mobile': self.enable_mobile,
            'enable_desktop': self.enable_desktop
        }

        return make_obj
