"use strict";

(function() {
    angular
    .module("app")
    .controller("ManageInstMenuController", [
        'AuthService', 'ManageInstItemsFactory',
        ManageInstMenuController]);

    function ManageInstMenuController(AuthService, ManageInstItemsFactory) {
        const manageInstMenuCtrl = this;

        manageInstMenuCtrl.$onInit = () => {
            _.defaults(manageInstMenuCtrl, {
                user: AuthService.getCurrentUser(),
            });
            
            manageInstMenuCtrl._loadSwitchInstOptions();
            manageInstMenuCtrl._loadInstitution();
        };

        manageInstMenuCtrl._loadInstitution = () => {
            const currentProfile = manageInstMenuCtrl._getProfilesAdmin()
                .find(prof => prof.institution_key === manageInstMenuCtrl.user.current_institution.key);
                
            manageInstMenuCtrl.institution = currentProfile.institution;
            manageInstMenuCtrl._loadMenuOptions();
        };

        manageInstMenuCtrl._loadMenuOptions = () => {
            // the slice was used to get just the first four items
            manageInstMenuCtrl.options = ManageInstItemsFactory.getItems(manageInstMenuCtrl.institution).slice(0,4);
        }

        manageInstMenuCtrl.getActionButtons = {
            goBack: () => window.history.back(),
            showImageCover: () => true
        };

        manageInstMenuCtrl._loadSwitchInstOptions = () => {
            manageInstMenuCtrl.switchInstOptions = manageInstMenuCtrl._getProfilesAdmin()
            .map(prof => {
                return {
                    getIcon: () => manageInstMenuCtrl._getIcon(prof.institution_key),
                    title: prof.institution.name,
                    action: () => manageInstMenuCtrl._switchInstitution(prof.institution)
                };
            });
        };

        manageInstMenuCtrl._getIcon = (instKey) => {
            const isInstSelected = manageInstMenuCtrl.user.current_institution.key === instKey;
            return isInstSelected ? "radio_button_checked" : "radio_button_unchecked";
        };

        manageInstMenuCtrl._switchInstitution = institution => {
            manageInstMenuCtrl.user.changeInstitution(institution);
            manageInstMenuCtrl._loadInstitution();
        };

        manageInstMenuCtrl._getProfilesAdmin = () => {
            return manageInstMenuCtrl.user.institution_profiles
                .filter(prof => manageInstMenuCtrl.user.isAdmin(prof.institution_key));
        };
    }
})();