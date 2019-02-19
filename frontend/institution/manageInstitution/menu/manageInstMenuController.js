"use strict";

(() => {
    angular
    .module("app")
    .controller("ManageInstMenuController", ManageInstMenuController);

    function ManageInstMenuController($state, AuthService, InstitutionService) {
        const manageInstMenuCtrl = this;

        manageInstMenuCtrl.$onInit = () => {
            manageInstMenuCtrl.user = AuthService.getCurrentUser();
            manageInstMenuCtrl._loadInstitution();
        };

        manageInstMenuCtrl._loadInstitution = () => {
            InstitutionService.getInstitution($state.params.institutionKey)
                .then(institution => {
                    manageInstMenuCtrl.institution = institution;
                    console.log(institution);
                    
                });
        }

        manageInstMenuCtrl.getActionButtons = {
            goBack: () => window.history.back(),
        }
    }
})();