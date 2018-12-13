"""Feature model."""
from google.appengine.ext import ndb

__all__ = ['Feature']

class Feature(ndb.Model):
    """
    Model of Feature
    """
    
    name = ndb.StringProperty()
    enable_mobile = ndb.StringProperty(
        choices=set(["SUPER_USER", "ADMIN", "ALL", "DISABLED"]))
    enable_desktop = ndb.StringProperty(
        choices=set(["SUPER_USER", "ADMIN", "ALL", "DISABLED"]))

    @staticmethod
    @ndb.transactional(xg=True)
    def create(name, enable_mobile="ALL", enable_desktop="ALL"):
        """
        Method to create new feature.

        Params:
        name -- Name of the new feature
        enable_mobile -- (Optional) User group to which the feature is enabled in the mobile version. If not received will be enabled for everyone.
        enable_desktop -- (Optional) User group to which the feature is enabled in the desktop version. If not received will be enabled for everyone.
        """

        feature = Feature(id=name, name=name, enable_desktop=enable_desktop, enable_mobile=enable_mobile)
        feature.put()
        return feature
    
    @staticmethod
    @ndb.transactional(xg=True)
    def enable_all(features_list):
        """
        Method to enable or disable multiple features.

        Params:
        features_list -- list of dictionaries containing the properties of the features model to be modified.
        """

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
        """
        Method to get all stored features.
        """

        features = Feature.query().fetch()
        return features

    @staticmethod
    def get_feature(feature_name):
        """
        Method to get feature by name.

        Params:
        feature_name -- name of the requested feature
        """

        feature = Feature.get_by_id(feature_name)
        
        if feature:
            return feature
        else:
            raise Exception("Feature not found!")

    def is_enabled(self):
        """
        Method to verify if the feature is enabled.
        """

        disabled_mobile = self.enable_mobile == 'DISABLED'
        disabled_desktop = self.enable_desktop == 'DISABLED'

        return not (disabled_desktop and disabled_mobile)

    def make(self):
        """
        Method to make feature.
        """

        make_obj = {
            'name': self.name,
            'enable_mobile': self.enable_mobile,
            'enable_desktop': self.enable_desktop
        }

        return make_obj
