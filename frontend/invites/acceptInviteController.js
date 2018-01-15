(function() {
    'use strict';

    var app = angular.module('app');

    app.controller("AcceptInviteController", function AcceptInviteController(
            InviteService, $stateParams, $state) {
        var controller = this;

        var invite_id = $stateParams.id;

        controller.invite = {};

        controller.loading = false;

        controller.displayLoading = function displayLoading() {
            controller.loading = true;
            controller.cancelSignup();
        };

        controller.goToHome = function goToHome() {
            $state.go("app.user.home");
        };
        
        controller.cancelSignup = function cancelSignup() {
            controller.signup = false;
        };

        controller.errorHandler = function errorHandler(error) {
            controller.loading = false;
        };
        
        (function main() {
            InviteService.getInvite(invite_id).then(function(response) {
                controller.invite = response.data;
                if (controller.invite.status === "accepted") {
                    $state.go("signin");
                }
            });
        })();
    });
})();