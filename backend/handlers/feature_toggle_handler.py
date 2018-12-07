"""Feature Toogle handler."""

import json
from . import BaseHandler
from utils import json_response
from util import login_required
from models import Feature


__all__ = ['FeatureToggleHander']

def to_json(feature_list):
    features = {
        feature.name: {
            "enabled": feature.enabled,
            "group": feature.group
        } for feature in feature_list
    }

    return features

class FeatureToggleHander(BaseHandler):
    
    @login_required
    @json_response
    def get(self, user):
        features = Feature.query().fetch()
        self.response.write(json.dumps(to_json(features)))
    
    @login_required
    @json_response
    def put(self, user):
        features_body = json.loads(self.request.body)
        features = Feature.enable_all(features_body)
        self.response.write(json.dumps(to_json(features)))