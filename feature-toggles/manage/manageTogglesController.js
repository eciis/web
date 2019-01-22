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
        manageTogglesCtrl.features = [];

        /**
         * Function to sign out of application.
         */
        manageTogglesCtrl.logout = function() {
            AuthService.logout();
        };

        /**
         * This function save the feature modifications.
         * @param {Object} feature - Feature to be saved.
         */
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

        /**
         * Function to get all features from backend.
         */
        function loadFeatures() {
            return ManageTogglesService.getAllFeatureToggles().then(function(features) {
                manageTogglesCtrl.features = features;
                return features;
            }).catch(response => {
                MessageService.showToast(response.data.msg);
            });
        }

        /**
         * This function initialize the controller by loading all features.
         */
        manageTogglesCtrl.$onInit = function() {
            return loadFeatures();
        };
    }]);
})();