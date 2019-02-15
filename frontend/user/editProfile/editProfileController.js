'use strict';

(function () {
    angular
    .module("app")
    .controller("EditProfileController", [
        'profile', 'ProfileService', 'AuthService', '$mdDialog', 'MessageService', 'ObserverRecorderService',
        EditProfileController
    ]);
    
    function EditProfileController(profile, ProfileService, AuthService, $mdDialog, MessageService, ObserverRecorderService) {
        const editProfileCtrl = this;
        
        editProfileCtrl.phoneRegex = "[0-9]{2}[\\s][0-9]{4,5}[-][0-9]{4,5}";
        let profileObserver = {};
        let oldProfile;
        
        /**
         * Sets up the current user, the profile that is going to be edited
         * and the abserver that will capture the changes to create a patch object 
         */
        editProfileCtrl.$onInit = () => {
            editProfileCtrl.user = AuthService.getCurrentUser();
            editProfileCtrl.profile = profile;
            oldProfile = _.clone(editProfileCtrl.profile);
            profileObserver = ObserverRecorderService.register(editProfileCtrl.user);
        };

        /**
         * Gets the institution name and abreviates it 
         * if is longer than 67 characters
         */
        editProfileCtrl.getInstName = () => {
            return Utils.limitString(editProfileCtrl.profile.institution.name, 67);
        };

        /**
         * Save the changes done in the current profile
         * if all of its fields are corrected filled
         */
        editProfileCtrl.edit = function edit() {
            if (isValidProfile()) {
                var patch = ObserverRecorderService.generate(profileObserver);
                if (!_.isEmpty(patch)) {
                    ProfileService.editProfile(patch)
                        .then(() => {
                            MessageService.showToast('Perfil editado com sucesso');
                            AuthService.save();
                        });
                }
                $mdDialog.hide();
            } else {
                MessageService.showToast('O cargo é obrigatório.');
            }
        };

        /**
         * Calls the removeProfile function to remove the current profile
         * @param {object} event - javascript event 
         */
        editProfileCtrl.removeProfile = (event) => {
            ProfileService.removeProfile(event, profile.institution);
        };

        /**
         * Closes the profile and restores the profile to its orinal state 
         * if some changes were done, but not saved
         */
        editProfileCtrl.closeDialog = function closeDialog() {
            const indexOfProfile = editProfileCtrl.user.institution_profiles.indexOf(editProfileCtrl.profile);
            editProfileCtrl.user.institution_profiles[indexOfProfile] = oldProfile;
            $mdDialog.hide();
        };

        /**
         * Check if the profile has the field office filled
         */
        function isValidProfile() {
            return !_.isEmpty(editProfileCtrl.profile.office);
        }
    };
})();