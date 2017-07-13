'use strict';
(function() {
    var app = angular.module('app');

    app.controller("InviteInstitutionController", function InviteInstitutionController(
        InviteService, $mdToast, $state, AuthService) {
        var inviteController = this;

        inviteController.invite = {};
        inviteController.sent_invitations = [];

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
            invite = new Invite(inviteController.invite, 'institution', currentInstitutionKey, inviteController.user.email);
            if (!invite.isValid()) {
                showToast('Convite inválido!');
            } else {
                var promise = InviteService.sendInvite(invite);
                promise.then(function success(response) {
                    inviteController.sent_invitations.push(invite);
                    showToast('Convite enviado com sucesso!');
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

        function loadSentInvitations() {
            InviteService.getSentInstitutionInvitations().then(function success(response) {
                inviteController.sent_invitations = response.data;
            }, function error(response) {
                $state.go('app.home');
                showToast(response.data.msg);
            });
        }

        loadSentInvitations();
    });
})();