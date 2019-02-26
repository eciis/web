"use strict";

(() => {
    angular
    .module("app")
    .controller("ManageInstMenuController", ManageInstMenuController);

    function ManageInstMenuController(AuthService, InstitutionService, ManageInstItemsFactory) {
        const manageInstMenuCtrl = this;

        manageInstMenuCtrl.$onInit = () => {
            _.defaults(manageInstMenuCtrl, {
                user: AuthService.getCurrentUser(),
            });
            
            manageInstMenuCtrl._loadSwitchInstOptions();
            manageInstMenuCtrl._loadInstitution();
        };

        manageInstMenuCtrl._loadInstitution = () => {
            InstitutionService.getInstitution(manageInstMenuCtrl.user.current_institution.key)
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
            const getIcon = (instKey) => {
                const isInstSelected = manageInstMenuCtrl.user.current_institution.key === instKey;
                return isInstSelected ? "radio_button_checked" : "radio_button_unchecked";
            };
            
            manageInstMenuCtrl.switchInstOptions = manageInstMenuCtrl.user.institution_profiles
                .filter(prof => manageInstMenuCtrl.user.isAdmin(prof.institution_key))
                .map(prof => {
                    return {
                        getIcon: () => getIcon(prof.institution_key),
                        title: prof.institution.name,
                        action: () => switchInstitution(prof.institution)
                    };
                });
        };

        const switchInstitution = institution => {
            manageInstMenuCtrl.user.changeInstitution(institution);
            manageInstMenuCtrl._loadInstitution();
        };
    }
})();