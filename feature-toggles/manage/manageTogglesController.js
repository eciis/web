(function() {
    'use strict';

    const app = angular.module('app');

    app.controller('ManageTogglesController', function(ManageTogglesService, AuthService, MessageService) {
        const manageTogglesCtrl = this;
        manageTogglesCtrl.isLoading = false;
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
            manageTogglesCtrl.isLoading = true;
            const promise = ManageTogglesService.saveFeatures(manageTogglesCtrl.modifiedFeatures)
                .then(response => {
                    MessageService.showToast("Alterações salvas com sucesso.");
                    return response;
                }).catch(response => {
                    MessageService.showToast(response.msg);
                }).finally(function() {
                    manageTogglesCtrl.isLoading = false;
                });
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