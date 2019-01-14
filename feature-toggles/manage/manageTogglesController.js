(function() {
    'use strict';

    const app = angular.module('app');

    app.controller('ManageTogglesController', function(ManageTogglesService) {
        const manageTogglesCtrl = this;
        manageTogglesCtrl.features = [];

        manageTogglesCtrl.$onInit = function() {
            ManageTogglesService.getAllFeatureToggles().then(function(features) {
                manageTogglesCtrl.features = features;
            });
        };
    });
})();