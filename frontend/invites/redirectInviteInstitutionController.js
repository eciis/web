(function() {
    'use strict';

    var app = angular.module('app');

    app.controller("RedirectInviteInstitutionController", function RedirectInviteInstitutionController(
            InviteService, $stateParams, $state, AuthService, STATES) {
        var controller = this;

        var inviteId = $stateParams.id;

        controller.invite = {};
        controller.loading = false;

        controller.displayLoading = function displayLoading() {
            controller.loading = true;
            controller.cancelSignup();
        };

        controller.goToHome = function goToHome() {
            $state.go(STATES.HOME);
        };

        controller.signin = function signin() {
            if (AuthService.isLoggedIn()) {
                $state.go(STATES.NEW_INVITE, {key: inviteId});
            } else {
                $state.go('signin');
            }
        };
        
        controller.cancelSignup = function cancelSignup() {
            controller.signup = false;
        };

        controller.errorHandler = function errorHandler(error) {
            controller.loading = false;
        };
        
        (function main() {
            InviteService.getInvite(inviteId).then(function(response) {
                controller.invite = new Invite(response);
                if (controller.invite.status === "accepted") {
                    $state.go("signin");
                }
            });
        })();
    });
})();