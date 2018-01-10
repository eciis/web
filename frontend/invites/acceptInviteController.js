(function() {
    'use strict';

    var app = angular.module('app');

    app.controller("AcceptInviteController", function AcceptInviteController(
            InviteService, $stateParams, $state) {
        var controller = this;

        var invite_id = $stateParams.id;

        controller.invite = {};
        
        controller.cancelSignup = function cancelSignup() {
            controller.signup = false;
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