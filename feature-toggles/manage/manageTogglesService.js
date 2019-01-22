(function() {
    'use strict';

    const app = angular.module('app');

    /**
     * This service is responsible for loading and changing the 
     * features through requests to the backend.
     */
    app.service('ManageTogglesService', ['HttpService', function(HttpService) {
        const service = this;
        const URI = '/api/feature-toggles?lang=pt-br';

        /**
         * Function to get all features from backend.
         */
        service.getAllFeatureToggles = function getAllFeatureToggles() {
            return HttpService.get(URI);
        };

        /**
         * Function to save one or more features.
         * @param {Object} features - list of features to be save.
         */
        service.saveFeatures = function saveFeatures(features) {
            return HttpService.put(URI, features);
        };
    }]);
})();