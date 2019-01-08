(function() {
    'use strict';

    const app = angular.module('app');

    app.service('ManageTogglesService', function($http) {
        const service = this;
        const uri = 'api/feature-toggles';

        service.getAllFeatureToggles = function() {
            return $http.get(uri).then(function(response) {
                return response.data;
            });
        };
    });
})();