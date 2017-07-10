'use strict';
(function() {
    var app = angular.module('app');

    app.controller("InviteUserController", function InviteUserController(
        InviteService,$mdToast, $state, AuthService, InstitutionService) {
        var inviteController = this;

        inviteController.invite = {};
        inviteController.current_institution = {};
        inviteController.sent_invitations = [];

        var currentInstitutionKey = $state.params.institutionKey;
        var invite;

        Object.defineProperty(inviteController, 'user', {
            get: function() {
                return AuthService.user;
            }
        });

        inviteController.sendUserInvite = function sendInvite() {
            invite = new Invite(inviteController.invite, 'user', currentInstitutionKey);
            if (invite.isValid()) {
                InviteService.sendInstInvite(invite).then(function success(response) {
                    inviteController.sent_invitations.push(inviteController.invite);
                    showToast('Convite enviado com sucesso!');
                }, function error(response) {
                    showToast(response.data.msg);
                });
            } else {
                showToast('Convite inválido!');
            }
        };

        function loadInstitution() {
            InstitutionService.getInstitution(currentInstitutionKey).then(function success(response) {
                inviteController.current_institution = response.data;
                inviteController.sent_invitations = inviteController.current_institution.sent_invitations;
                getMembers();
            }, function error(response) {
                $state.go("app.home");
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