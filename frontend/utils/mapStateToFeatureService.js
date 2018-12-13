(function() {
    'use strict';

    const app = angular.module('app');


    app.service('MapStateToFeatureService', function(STATES) {
        const service = this;

        service._statesToFeature = {
            [STATES.MANAGE_INST_EDIT]: 'manage-inst-edit'
        };

        service.getFeatureByState = function getFeatureByState(stateName) {
            return _.get(service._statesToFeature, stateName, null);
        };

        service.containsFeature = function containsFeature(stateName) {
            return stateName in service._statesToFeature;
        };
    });
})();