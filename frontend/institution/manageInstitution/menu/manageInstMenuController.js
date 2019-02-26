"use strict";

(() => {
    angular
    .module("app")
    .controller("ManageInstMenuController", ManageInstMenuController);

    function ManageInstMenuController($state, AuthService, InstitutionService, ManageInstItemsFactory) {
        const manageInstMenuCtrl = this;

        manageInstMenuCtrl.$onInit = () => {
            _.defaults(manageInstMenuCtrl, {
                user: AuthService.getCurrentUser(),
                
            });

            console.log(manageInstMenuCtrl.user);
            manageInstMenuCtrl._loadInstitution();
        };

        manageInstMenuCtrl._loadInstitution = () => {
            InstitutionService.getInstitution($state.params.institutionKey)
                .then(institution => {
                    manageInstMenuCtrl.institution = institution;
                    manageInstMenuCtrl._loadMenuOptions(institution);
                });
        };

        manageInstMenuCtrl._loadMenuOptions = (institution) => {
            // the slice was used to get just the first four items
            manageInstMenuCtrl.options = ManageInstItemsFactory.getItems(institution).slice(0,4);
        }

        manageInstMenuCtrl.getActionButtons = {
            goBack: () => window.history.back(),
            showImageCover: () => true
        };

        manageInstMenuCtrl._loadSwitchInstOptions = () => {
            return manageInstMenuCtrl.user && manageInstMenuCtrl.user
                .institution_profiles
                .map(prof => {
                    return {
                        icon: 'bookmark',
                        title: prof.institution.name
                    };
                });
        }
        
    }
})();