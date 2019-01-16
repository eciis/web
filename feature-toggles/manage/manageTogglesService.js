(function() {
    'use strict';

    const app = angular.module('app');

    app.service('ManageTogglesService', function(HttpService) {
        const service = this;
        const URI = '/api/feature-toggles';

        service.getAllFeatureToggles = function getAllFeatureToggles() {
            return HttpService.get(URI);
        };

        service.saveFeatures = function saveFeatures(features) {
            return HttpService.put(URI, features);
        };
    });
})();