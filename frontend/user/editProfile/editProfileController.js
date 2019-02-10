'use strict';

(function () {
    const app = angular.module("app");

    app.controller("EditProfileController", function EditProfileController(profile, ProfileService,
        AuthService, $mdDialog, MessageService, ObserverRecorderService) {
        const editProfileCtrl = this;
        
        editProfileCtrl.phoneRegex = "[0-9]{2}[\\s][0-9]{4,5}[-][0-9]{4,5}";
        let profileObserver = {};
        let oldProfile;
        
        editProfileCtrl.$onInit = () => {
            editProfileCtrl.user = AuthService.getCurrentUser();
            editProfileCtrl.profile = profile;
            oldProfile = _.clone(editProfileCtrl.profile);
            profileObserver = ObserverRecorderService.register(editProfileCtrl.user);
        };

        editProfileCtrl.getInstName = () => {
            return Utils.limitString(editProfileCtrl.profile.institution.name, 67);
        };

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

        editProfileCtrl.closeDialog = function closeDialog() {
            const indexOfProfile = editProfileCtrl.user.institution_profiles.indexOf(editProfileCtrl.profile);
            editProfileCtrl.user.institution_profiles[indexOfProfile] = oldProfile;
            $mdDialog.hide();
        };

        function isValidProfile() {
            return !_.isEmpty(editProfileCtrl.profile.office);
        }
    });
})();