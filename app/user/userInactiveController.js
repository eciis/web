'use strict';

(function() {
    var app = angular.module("app");

    app.controller("UserInactiveController", function UserInactiveController(AuthService, $mdDialog) {
        var userInactiveCtrl = this;

        userInactiveCtrl.user = AuthService.getCurrentUser();

        userInactiveCtrl.logout = function logout() {
            AuthService.logout();
        };

        userInactiveCtrl.resquestInvitation = function resquestInvitation(event) {
            $mdDialog.show({
                controller: "RequestInvitationController",
                controllerAs: "requestInvCtrl",
                templateUrl: 'requests/request_invitation_dialog.html',
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose:true,
                openFrom: '#fab-new-post',
                closeTo: angular.element(document.querySelector('#fab-new-post'))
            });
        };
    });
})();