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
         * Function to save feature.
         * @param {Object} feature - feature to be save.
         */
        service.saveFeature = function saveFeature(feature) {
            return HttpService.put(URI, feature);
        };
    }]);
})();