'use strict';
(function() {
    var app = angular.module('app');

    app.controller("InviteUserController", function InviteUserController(
        InviteService, $mdToast, $state, InstitutionService, AuthService) {
        var inviteController = this;

        inviteController.invite = {};
        inviteController.sent_invitations = [];

        var currentInstitutionKey = $state.params.institutionKey;
        var invite;

        Object.defineProperty(inviteController, 'user', {
            get: function() {
                return AuthService.user;
            }
        });

        inviteController.sendUserInvite = function sendInvite() {
            invite = new Invite(inviteController.invite, 'user', currentInstitutionKey, inviteController.user.email);
            console.log(invite);
            if (! invite.isValid()) {
                showToast('Convite inválido!');
            } else {
                var promise = InviteService.sendInvite(invite);
                promise.then(function success(response) {
                    inviteController.sent_invitations.push(invite);
                    inviteController.invite = {};
                    showToast('Convite enviado com sucesso!');
                }, function error(response) {
                    showToast(response.data.msg);
                });
                return promise;
            }
        };

        function loadInstitution() {
            InstitutionService.getInstitution(currentInstitutionKey).then(function success(response) {
                inviteController.sent_invitations = response.data.sent_invitations;
                getMembers();
            }, function error(response) {
                $state.go('app.institution', {institutionKey: currentInstitutionKey});
                showToast(response.data.msg);
            });
        }

        function getMembers() {
            InstitutionService.getMembers(currentInstitutionKey).then(function success(response) {
                inviteController.members = response.data;
            }, function error(response) {
                showToast(response.data.msg);
            });
        }

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

        loadInstitution();
    });
})();