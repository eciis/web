'use strict';

(function () {
    const app = angular.module("app");

    app.controller("ProfileController", ['user', 'currentUserKey', 'institutionKey', 'UserService', '$state', '$mdDialog', 'STATES', 
        function ProfileController(user, currentUserKey, institutionKey, UserService, $state, $mdDialog, STATES) {
        var profileCtrl = this;

        profileCtrl.loading = true;

        UserService.getUser(user).then(function success(response) {
            profileCtrl.user = response;
            profileCtrl.loading = false;
            profileCtrl.currentProfile = _.find(profileCtrl.user.institution_profiles, (profile) => {
                return profile.institution_key === institutionKey;
            });
        });

        profileCtrl.isToShow = function () {
            if (profileCtrl.user) {
                return !_.isEmpty(profileCtrl.user.institution_profiles);
            }
            return false;
        };

        profileCtrl.showProperty = (property, limit) => {
            return Utils.limitString(property, limit) || 'Não informado';
        };

        profileCtrl.goToConfigProfile = function goToConfigProfile() {
            $state.go(STATES.CONFIG_PROFILE);
            $mdDialog.cancel();
        };

        profileCtrl.goToUserProfilePage = (userKey) => {
            /**
             * TODO: implements this function to go to the user profile page
             * when the same be implemented
             * @tiagolimpe - Jan - 23 - 2019
             */
        };

        profileCtrl.isOwnProfile = function isOwnProfile() {
            return user === currentUserKey;
        };

        profileCtrl.closeDialog = () => {
            $mdDialog.cancel();
        };
    }]);
})();