'use strict';

(function () {
    const app = angular.module("app");

    app.controller("EditProfileController", function EditProfileController(institution, ProfileService,
        AuthService, $mdDialog, MessageService, ObserverRecorderService) {
        var editProfileCtrl = this;
        editProfileCtrl.phoneRegex = "[0-9]{2}[\\s][0-9]{4,5}[-][0-9]{4,5}";
        editProfileCtrl.user = AuthService.getCurrentUser();
        editProfileCtrl.institution = institution;
        let profileObserver = {};
        let oldProfile;

        editProfileCtrl.edit = function edit() {
            if (isValidProfile()) {
                var patch = ObserverRecorderService.generate(profileObserver);
                if (!_.isEmpty(patch)) {
                    ProfileService.editProfile(patch).then(function success() {
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

        (function main() {
            editProfileCtrl.profile = editProfileCtrl.user.institution_profiles
                .filter(profile => profile.institution_key === editProfileCtrl.institution.key)
                .reduce(profile => profile);
            oldProfile = _.clone(editProfileCtrl.profile);
            profileObserver = ObserverRecorderService.register(editProfileCtrl.user);
        })();
    });
})();