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

        /**
         * Sets the user current institution in the controller
         * than it loads the menu options
         */
        manageInstMenuCtrl._loadInstitution = () => {
            manageInstMenuCtrl.institution = manageInstMenuCtrl.user.current_institution;
            manageInstMenuCtrl._loadMenuOptions();
        };

        /**
         * Sets the options that are going to be showed on the menu 
         */
        manageInstMenuCtrl._loadMenuOptions = () => {
            // the slice was used to get just the first four items
            manageInstMenuCtrl.options = ManageInstItemsFactory.getItems(manageInstMenuCtrl.institution).slice(0,4);
        }

        /**
         * Property with the actions that are going to be used by the
         * institution-header component 
         */
        manageInstMenuCtrl.getActionButtons = {
            goBack: () => window.history.back(),
            showImageCover: () => true
        };

        /**
         * For each profile in which the user is admin,
         * a menu option is generated to be used in the
         * switch institution menu, on the white-toolbar component
         */
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

        /**
         * Returns the corresponding icon button depending 
         * on the given institution key if it is the user current institution
         * @param {string} instKey - institution key
         */
        manageInstMenuCtrl._getIcon = (instKey) => {
            const isInstSelected = manageInstMenuCtrl.user.current_institution.key === instKey;
            return isInstSelected ? "radio_button_checked" : "radio_button_unchecked";
        };

        /**
         * Changes the user current institution to the given one
         * than reloads the controller institution
         */
        manageInstMenuCtrl._switchInstitution = institution => {
            manageInstMenuCtrl.user.changeInstitution(institution);
            manageInstMenuCtrl._loadInstitution();
        };

        /**
         * Returns all the user instituton profiles in which she is admin
         */
        manageInstMenuCtrl._getProfilesAdmin = () => {
            return manageInstMenuCtrl.user.institution_profiles
                .filter(prof => manageInstMenuCtrl.user.isAdmin(prof.institution_key));
        };
    }
})();