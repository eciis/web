'use strict';

(function() {
    var app = angular.module("app");

    app.service("ProfileService", function UserService($mdDialog, $http, $q) {
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

        service.editProfile = function editProfile(data) {
            var deffered = $q.defer();
            $http.patch('/api/user', data).then(function success(info) {
                deffered.resolve(info);
            }, function error(info) {
                deffered.reject(info);
            });
            return deffered.promise;
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

            profileCtrl.showProperty = function getProperty(property) {
                return property || 'Não informado';
            };
        }
    });
})();