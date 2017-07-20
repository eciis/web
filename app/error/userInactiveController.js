'use strict';

(function() {
    var app = angular.module("app");
    
    app.controller("UserInactiveController", function UserInactiveController(AuthService) {
        var userInactiveCtrl = this;

        userInactiveCtrl.user = AuthService.getCurrentUser();

        userInactiveCtrl.logout = function logout() {
            AuthService.logout();
        };
    });
})();