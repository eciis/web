'use strict';

(function() {
    var app = angular.module("app");

    var USER_URI = '/api/user';

    app.service("ProfileService", function UserService($mdDialog, $http, $q, AuthService) {
        var service = this;

        service.showProfile  = function showProfile(userKey, ev) {
             $mdDialog.show({
                templateUrl: 'app/user/profile.html',
                controller: "ProfileController",
                controllerAs: "profileCtrl",
                locals: {
                    user: userKey,
                    currentUserKey: AuthService.getCurrentUser().key
                },
                targetEvent: ev,
                clickOutsideToClose: true
            });
        };

        service.editProfile = function editProfile(data) {
            data = JSON.parse(angular.toJson(data));
            var deffered = $q.defer();
            $http.patch(USER_URI, data).then(function success(info) {
                deffered.resolve(info);
            }, function error(info) {
                deffered.reject(info);
            });
            return deffered.promise;
        };

    });
})();