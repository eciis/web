(function() {
    'use strict';

    const app = angular.module('app');

    /**
     * This controller manages the view that displays all features for the user.
     */
    app.controller('ManageTogglesController', ['ManageTogglesService' , 'AuthService', 'MessageService' , function(ManageTogglesService, AuthService, 
        MessageService) {
        
        const manageTogglesCtrl = this;
        manageTogglesCtrl.isLoading = false;
        manageTogglesCtrl.oddFeatures = [];
        manageTogglesCtrl.features = [];

        manageTogglesCtrl.logout = function() {
            AuthService.logout();
        };

        manageTogglesCtrl.save = function save(feature) {
                feature.isLoading = true;
                return ManageTogglesService.saveFeatures([feature])
                    .then(response => {
                        MessageService.showToast("Alterações salvas com sucesso.");
                        return response;
                    }).catch(response => {
                        MessageService.showToast(response.msg);
                    }).finally(function() {
                        feature.isLoading = false;
                    });
        };

        function loadFeatures() {
            return ManageTogglesService.getAllFeatureToggles().then(function(features) {
                manageTogglesCtrl.oddFeatures = features;
                manageTogglesCtrl.features = _.cloneDeep(features);
                return features;
            });
        }

        manageTogglesCtrl.$onInit = function() {
            return loadFeatures();
        };
    }]);
})();