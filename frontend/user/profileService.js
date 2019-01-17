'use strict';

(function() {
    var app = angular.module("app");

    var USER_URI = '/api/user';

    app.service("ProfileService", function UserService($mdDialog, HttpService, $q, AuthService) {
        var service = this;

        service.showProfile  = function showProfile(userKey, ev, institutionKey) {
             $mdDialog.show({
                parent: angular.element(document.body),
                templateUrl: Utils.selectFieldBasedOnScreenSize('app/user/profile.html',
                    'app/user/profile_mobile.html', 475),
                controller: "ProfileController",
                controllerAs: "profileCtrl",
                locals: {
                    user: userKey,
                    currentUserKey: AuthService.getCurrentUser().key,
                    institutionKey: institutionKey
                },
                targetEvent: ev,
                clickOutsideToClose: true
            });
        };

        service.editProfile = function editProfile(data) {
            data = JSON.parse(angular.toJson(data));
            return HttpService.patch(USER_URI, data);
        };

    });
})();