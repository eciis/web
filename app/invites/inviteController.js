'use strict';
(function() {
    var app = angular.module('app');

    app.controller("InviteController", function InviteController(
        InviteService,$mdToast, $state, AuthService) {
        var inviteController = this;

        inviteController.invite = {};

        var currentInstitutionKey = $state.params.institutionKey;
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
            invite = new Invite(inviteController.invite, 'institution');
            if (invite.isValid()) {
                InviteService.sendInstInvite(invite).then(function success(response) {
                    showToast('Convite enviado com sucesso!');
                    $state.go("app.home");
                }, function error(response) {
                    showToast(response.data.msg);
                });
            } else {
                showToast('Convite inválido!');
            }
        };

        inviteController.sendUserInvite = function sendInvite() {
            invite = new Invite(inviteController.invite, 'user');
            invite.institution_key = currentInstitutionKey;
            if (invite.isValid()) {
                InviteService.sendInstInvite(invite).then(function success(response) {
                    showToast('Convite enviado com sucesso!');
                    $state.go('app.institution', {institutionKey: currentInstitutionKey});
                }, function error(response) {
                    showToast(response.data.msg);
                });
            } else {
                showToast('Convite inválido!');
            }
        };

        inviteController.cancelUserInvite = function cancelInvite() {
           $state.go('app.institution', {institutionKey: currentInstitutionKey});
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