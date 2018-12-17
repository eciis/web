"""Feature Toggle handler."""

import json
from . import BaseHandler
from utils import json_response
from util import login_required
from models import Feature


__all__ = ['FeatureToggleHandler']

def to_json(feature_list):
    """
    Method to generate list of feature models in json format object.

    Params:
    feature_list -- List of features objects
    """
    
    features = [feature.make() for feature in feature_list]
    return json.dumps(features)

class FeatureToggleHandler(BaseHandler):
    """Feature toggle hanler."""
    
    @json_response
    @login_required
    def get(self, user):
        """
        Method to get all features or filter by name using query parameter.
        """

        feature_name = self.request.get('name')

        if feature_name:
            features = [Feature.get_feature(feature_name)]
        else:
            features = Feature.get_all_features()

        self.response.write(to_json(features))
    
    @login_required
    @json_response
    def put(self, user):
        """
        Method for modifying the properties of one or more features.
        """

        features_body = json.loads(self.request.body)
        features = Feature.set_visibility(features_body)
        self.response.write(to_json(features))
