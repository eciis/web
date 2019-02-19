"use strict";

(() => {
    angular
    .module("app")
    .controller("ManageInstMenuController", ManageInstMenuController);

    function ManageInstMenuController($state, AuthService, InstitutionService, ManageInstItemsFactory) {
        const manageInstMenuCtrl = this;

        manageInstMenuCtrl.$onInit = () => {
            manageInstMenuCtrl.user = AuthService.getCurrentUser();
            manageInstMenuCtrl._loadInstitution();
        };

        manageInstMenuCtrl._loadInstitution = () => {
            InstitutionService.getInstitution($state.params.institutionKey)
                .then(institution => {
                    manageInstMenuCtrl.institution = institution;
                    manageInstMenuCtrl._loadMenuOptions(institution);
                    console.log(institution);
                });
        };

        manageInstMenuCtrl._loadMenuOptions = (institution) => {
            // the slice was used to get just the first four items
            manageInstMenuCtrl.options = ManageInstItemsFactory.getItems(institution).slice(0,4);
        }

        manageInstMenuCtrl.getActionButtons = {
            goBack: () => window.history.back(),
        };
    }
})();