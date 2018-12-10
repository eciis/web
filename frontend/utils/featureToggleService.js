(function() {
    'use strict';

    const app = angular.module('app');

    app.service('FeatureToggleService', function FeatureToggleService(HttpService) {
        const service = this;
        const uri = '/api/feature-toggle';

        service.getFeatures = function getFeatures() {
            HttpService.get(uri).then(function(response) {
                console.log(response);
            });
        };

        service.getFeatures();
    });
})();