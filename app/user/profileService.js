'use strict';

(function() {
    var app = angular.module("app");

    app.service("ProfileService", function UserService($mdDialog) {
        var service = this;

        service.showProfile  = function showProfile(userKey, ev) {
             $mdDialog.show({
                templateUrl: 'user/profile.html',
                controller: ProfileController,
                controllerAs: "profileCtrl",
                locals: {
                    user: userKey
                },
                targetEvent: ev,
                clickOutsideToClose: true
            });
        };

        function ProfileController(user, UserService) {
            var profileCtrl = this;

            UserService.getUser(user).then(function success(response) {
                    profileCtrl.user = response;
            });

            profileCtrl.isToShow = function() {
                if(profileCtrl.user) {
                    return !_.isEmpty(profileCtrl.user.institution_profiles);
                }
                return false;
            };

            profileCtrl.phone = function phone(profilePhone) {
                return profilePhone || 'Não informado';
            };

            profileCtrl.email = function email(profileEmail) {
                return profileEmail || 'Não informado';
            };
        }
    });
})();