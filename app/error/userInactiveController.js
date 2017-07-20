'use strict';

(function() {
    var app = angular.module("app");
    
    app.controller("UserInactiveController", function UserInactiveController(AuthService) {
        var userInactiveCtrl = this;

        userInactiveCtrl.user = AuthService.getCurrentUser();

        /*
        * To implement this function when search of institution finished
        */
        userInactiveCtrl.requestInvite = function() {

        };

        userInactiveCtrl.logout = function logout() {
            AuthService.logout();
        };
    });
})();