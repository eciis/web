'use strict';

(function () {
    const app = angular.module("app");

    app.controller("ColorPickerController", function ColorPickerController(user, ProfileService, MessageService, $mdDialog, AuthService, $http) {
        var colorPickerCtrl = this;
        colorPickerCtrl.user = user;

        colorPickerCtrl.saveColor = function saveColor() {
            var diff = jsonpatch.compare(colorPickerCtrl.user, colorPickerCtrl.newUser);
            var promise = ProfileService.editProfile(diff);
            promise.then(function success() {
                MessageService.showToast('Cor salva com sucesso');
                colorPickerCtrl.user.institution_profiles = colorPickerCtrl.newUser.institution_profiles;
                $mdDialog.cancel();
                AuthService.save();
            });
            return promise;
        };

        colorPickerCtrl.cancelDialog = function cancelDialog() {
            $mdDialog.cancel();
        };

        function loadProfile() {
            colorPickerCtrl.newUser = _.cloneDeep(colorPickerCtrl.user);

            colorPickerCtrl.newProfile = _.find(colorPickerCtrl.newUser.institution_profiles, function (profile) {
                return profile.institution_key === colorPickerCtrl.newUser.current_institution.key;
            });
        }

        function loadColors() {
            $http.get('app/home/colors.json').then(function success(response) {
                colorPickerCtrl.colors = response.data;
            });
        }

        (function main() {
            loadProfile();
            loadColors();
        })();
    });
})();