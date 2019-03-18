'use strict';

(function () {
    const app = angular.module("app");

    app.controller("ColorPickerController", function ColorPickerController(user, institution, ProfileService, MessageService, $mdDialog, AuthService, $http) {
        var colorPickerCtrl = this;
        colorPickerCtrl.user = user;
        colorPickerCtrl.institution = {};
        colorPickerCtrl.oldColorValue = institution.color;

        colorPickerCtrl.saveColor = function saveColor() {
            var diff = jsonpatch.compare(colorPickerCtrl.user, colorPickerCtrl.newUser);
            var promise = ProfileService.editProfile(diff);
            promise.then(function success() {
                MessageService.showInfoToast('Cor salva com sucesso');
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

            colorPickerCtrl.institution = _.find(colorPickerCtrl.newUser.institution_profiles, ['institution_key', institution.institution_key]);
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