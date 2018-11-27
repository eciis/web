'use strict';

(function () {
    const app = angular.module("app");

    app.controller("ProfileController", function ProfileController(user, currentUserKey, UserService, $state, $mdDialog) {
        var profileCtrl = this;

        profileCtrl.loading = true;

        UserService.getUser(user).then(function success(response) {
            profileCtrl.user = response;
            profileCtrl.loading = false;
        });

        profileCtrl.isToShow = function () {
            if (profileCtrl.user) {
                return !_.isEmpty(profileCtrl.user.institution_profiles);
            }
            return false;
        };

        profileCtrl.showProperty = function getProperty(property) {
            return Utils.limitString(property, 35) || 'Não informado';
        };

        profileCtrl.goToConfigProfile = function goToConfigProfile() {
            $state.go(STATES.CONFIG_PROFILE);
            $mdDialog.cancel();
        };

        profileCtrl.isOwnProfile = function isOwnProfile() {
            return user === currentUserKey;
        };
    });
})();