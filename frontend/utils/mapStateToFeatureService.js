(function() {
    'use strict';

    const app = angular.module('app');

    app.service('MapStateToFeatureService', function(STATES) {
        const service = this;

        service._statesToFeature = {
            [STATES.MANAGE_INST_EDIT]: 'manage-inst-edit'
        };

        /**
         * Function to get feature by state name
         * 
         * @param {String} stateName - name of state to get related feature
         * @return {String} Feature name if the state is registered, otherwise returns null
         */
        service.getFeatureByState = function getFeatureByState(stateName) {
            return _.get(service._statesToFeature, stateName, null);
        };

        /**
         * Function to check if exists feature for state passed by parameter
         * 
         * @param {String} stateName - Name of state to be check
         * @return {Boolean} True if exists, otherwise, false
         */
        service.containsFeature = function containsFeature(stateName) {
            return stateName in service._statesToFeature;
        };
    });
})();