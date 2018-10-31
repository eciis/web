"use strict";

(function() {
    angular.module("app")
    .controller("EmailVerificationController", function ($state) {
        const emailVerifCtrl = this;

        emailVerifCtrl.return = function () {
            $state.go("signin");
        };

        emailVerifCtrl.next = function () {
            $state.go("user_inactive");
        };
    });
})();