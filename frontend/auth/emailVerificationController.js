"use strict";

(function() {
    angular.module("app")
    .controller("EmailVerificationController", function ($state, AuthService) {
        const emailVerifCtrl = this;

        emailVerifCtrl.logout = function () {
            AuthService.logout();
        };

        emailVerifCtrl.next = function () {
            $state.go("user_inactive");
        };
    });
})();