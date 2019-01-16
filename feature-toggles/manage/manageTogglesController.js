(function() {
    'use strict';

    const app = angular.module('app');

    app.controller('ManageTogglesController', function(ManageTogglesService, AuthService) {
        const manageTogglesCtrl = this;
        manageTogglesCtrl.features = [];
        manageTogglesCtrl.modifiedFeatures = [];

        manageTogglesCtrl.logout = function() {
            AuthService.logout();
        };

        manageTogglesCtrl.addModifiedFeature = function(feature) {
            const featureFound = _.find(manageTogglesCtrl.modifiedFeatures, element => element.name === feature.name);

            if (!featureFound) {
                manageTogglesCtrl.modifiedFeatures.push(feature);
            }
        };

        manageTogglesCtrl.save = function save() {
            const promise = ManageTogglesService.saveFeatures(manageTogglesCtrl.modifiedFeatures);
            manageTogglesCtrl.modifiedFeatures = [];
            return promise;
        };

        manageTogglesCtrl.$onInit = function() {
            return ManageTogglesService.getAllFeatureToggles().then(function(features) {
                manageTogglesCtrl.features = features;
                return features;
            });
        };
    });
})();