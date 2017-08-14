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

        inviteController.user = AuthService.getCurrentUser();

        inviteController.sendUserInvite = function sendInvite() {
            invite = new Invite(inviteController.invite, 'USER', currentInstitutionKey, inviteController.user.key);
            if (inviteController.isUserInviteValid(invite)) {
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

        function getEmail(user) {
            return user.email;
        }

        function inviteeIsMember(invite) {
            return _.includes(_.map(inviteController.members, getEmail), invite.invitee);
        }

        function inviteeIsInvited(invite) {
            return _.some(inviteController.sent_invitations, invite);
        }

        inviteController.isUserInviteValid = function isUserInviteValid(invite) {
            var isValid = true;
            if (! invite.isValid()) {
                isValid = false;
                showToast('Convite inválido!');
            } else if (inviteeIsMember(invite)) {
                isValid = false;
                showToast('O convidado já é um membro!');
            } else if (inviteeIsInvited(invite)) {
                isValid = false;
                showToast('Este email já foi convidado');
            }
            return isValid;
        };

        loadInstitution();
    });
})();