"""Feature model."""
import json
from google.appengine.ext import ndb

__all__ = ['Feature']

class Feature(ndb.Model):
    """
    Model of Feature.
    """

    name = ndb.StringProperty()
    enable_mobile = ndb.StringProperty(
        choices=set(["SUPER_USER", "ADMIN", "ALL", "DISABLED"]))
    enable_desktop = ndb.StringProperty(
        choices=set(["SUPER_USER", "ADMIN", "ALL", "DISABLED"]))
    translation = ndb.JsonProperty(default="{}")

    @staticmethod
    @ndb.transactional(xg=True)
    def create(name, translation_dict, enable_mobile="ALL", enable_desktop="ALL"):
        """
        Method to create new feature.

        Params:
        name -- Name of the new feature
        enable_mobile -- (Optional) User group to which the feature is enabled in the mobile version. If not received will be enabled for everyone.
        enable_desktop -- (Optional) User group to which the feature is enabled in the desktop version. If not received will be enabled for everyone.
        """

        feature = Feature(id=name, name=name, enable_desktop=enable_desktop, enable_mobile=enable_mobile)
        feature.translation = json.dumps(translation_dict)
        feature.put()
        return feature
    
    @staticmethod
    def set_visibility(feature_dict):
        """
        Method to enable or disable feature.

        Params:
        features_dict -- dictionary containing the properties of the feature model to be modified.
        """

        feature = Feature.get_feature(feature_dict.get('name'))
        feature.enable_desktop = feature_dict['enable_desktop']
        feature.enable_mobile = feature_dict['enable_mobile']
        feature.put()
        return feature

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

    def make(self, language="pt-br"):
        """
        Method to make feature.
        """
        make_obj = {
            'name': self.name,
            'enable_mobile': self.enable_mobile,
            'enable_desktop': self.enable_desktop,
            'translation': json.loads(self.translation).get(language)
        }

        return make_obj
