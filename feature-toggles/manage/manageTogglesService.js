(function() {
    'use strict';

    const app = angular.module('app');

    app.service('ManageTogglesService', function($http) {
        const service = this;
        const URI = 'api/feature-toggles';

        service.getAllFeatureToggles = function() {
            return $http.get(URI).then(function(response) {
                return response.data;
            });
        };
    });
})();