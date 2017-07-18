'use strict';
(function() {
    var app = angular.module('app');

    app.controller("InviteInstitutionController", function InviteInstitutionController(
        InviteService,$mdToast, $state, AuthService) {
        var inviteController = this;

        inviteController.invite = {};

        var invite;

        Object.defineProperty(inviteController, 'user', {
            get: function() {
                return AuthService.user;
            }
        });

        inviteController.cancelInvite = function cancelInvite() {
            $state.go("app.home");
        };

        inviteController.sendInstInvite = function sendInvite() {
            var currentInstitutionKey = inviteController.user.current_institution.key;
            invite = new Invite(inviteController.invite, 'institution', currentInstitutionKey);
            if (!invite.isValid()) {
                showToast('Convite inválido!');
            } else {
                var promise = InviteService.sendInvite(invite);
                promise.then(function success(response) {
                    showToast('Convite enviado com sucesso!');
                    $state.go("app.home");
                }, function error(response) {
                    showToast(response.data.msg);
                });
                return promise;
            }
        };

        function showToast(msg) {
            $mdToast.show(
                $mdToast.simple()
                    .textContent(msg)
                    .action('FECHAR')
                    .highlightAction(true)
                    .hideDelay(5000)
                    .position('bottom right')
            );
        }
    });
})();